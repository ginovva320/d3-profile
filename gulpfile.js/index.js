'use strict';

const _               = require(`lodash`),
      browserify      = require(`browserify`),
      buffer          = require(`vinyl-buffer`),
      bump            = require(`./bump`),
      config          = require(`./config`),
      del             = require(`del`),
      envify          = require(`envify/custom`),
      eslint          = require(`eslint`),
      gulp            = require(`gulp`),
      gulpLoadPlugins = require(`gulp-load-plugins`),
      gutil           = require(`gulp-util`),
      nconf           = require(`nconf`),
      reportError     = require(`./error`),
      runSequence     = require(`run-sequence`),
      server          = require(`./server`),
      source          = require(`vinyl-source-stream`),
      watchify        = require(`watchify`);

const plugins     = gulpLoadPlugins(),
      linter      = new eslint.CLIEngine(),
      formatter   = linter.getFormatter(),
      origGulpsrc = gulp.src;

let runType;

const tasks = {
    setup: [`lint`, `clean`, `env`],
    compile: [`styles`, `root`, `browserify`, `index`]
};

gulp.src = function() {
    return origGulpsrc(...arguments)
        .pipe(plugins.plumber({
            errorHandler: reportError
        }));
};

gulp.task(`default`, cb => {
    runSequence(`serve`, cb);
});

gulp.task(`build`, cb => {
    runType = {
        build: `build`,
        serve: false
    };
    runSequence(tasks.setup, tasks.compile, cb);
});

gulp.task(`dist`, cb => {
    runType = {
        build: `dist`,
        serve: false
    };
    runSequence(tasks.setup, tasks.compile, cb);
});

gulp.task(`serve`, cb => {
    runType = {
        build: `build`,
        serve: true
    };
    runSequence(tasks.setup, tasks.compile, `server`, `watch`, cb);
});

gulp.task(`deploy`, cb => {
    runSequence(`dist`, `s3`, cb);
});

gulp.task(`lint`, cb => {
    const report = linter.executeOnFiles([`.`]);

    if (report.errorCount + report.warningCount === 0) {
        gutil.log(gutil.colors.cyan(`No ESLint warnings or errors!`));
    } else {
        gutil.log(formatter(report.results));
    }
    cb();
});

gulp.task(`clean`, cb => {
    del([
        runType.build === `build` ?
            config.dest.build :
            config.dest.dist
    ], cb);
});

gulp.task(`clean:all`, cb => {
    del([
        config.dest.build,
        config.dest.dist
    ], cb);
});

gulp.task(`env`, cb => {
    if (_.isUndefined(nconf.get(`env`))) {
        nconf
            .argv()
            .env()
            .defaults({
                env: `dev`
            });

        const env = nconf.get(`env`);

        nconf.file(`gulpfile.js/env/${env}.env.json`);

        gutil.log(`Loading environment: ${env}`);
    }
    cb();
});

gulp.task(`styles`, () => {
    return gulp.src(config.entry.less)
        .pipe(plugins.if(runType.build === `build`, plugins.sourcemaps.init()))
        .pipe(plugins.less())
        .pipe(plugins.if(runType.build === `dist`, plugins.minifyCss({
            keepSpecialComments: 0,
            rebase: false
        })))
        .pipe(plugins.header(config.banner))
        .pipe(plugins.if(runType.build === `build`, plugins.sourcemaps.write()))
        .pipe(plugins.rename(`${config.buildfile}.css`))
        .pipe(plugins.size({
            showFiles: true
        }))
        .pipe(gulp.dest(`${runType.build === `build` ? config.dest.build : config.dest.dist}/assets`))
        .pipe(plugins.livereload());
});

gulp.task(`root`, () => {
    return gulp.src(config.source.root)
        .pipe(gulp.dest(runType.build === `build` ? config.dest.build : config.dest.dist))
        .pipe(plugins.livereload());
});

gulp.task(`browserify`, [`env`], () => {
    let browsePackage = browserify(_.merge(watchify.args, {
        entries: [config.entry.js],
        debug: runType.build === `build`
    }));

    if (runType.serve) {
        browsePackage = watchify(browsePackage);
    }

    browsePackage
        .transform(envify({
            BATTLE_NET_KEY: nconf.get(`BATTLE_NET_KEY`),
            BATTLE_NET_URL: nconf.get(`BATTLE_NET_URL`),
            D3_MEDIA_URL: nconf.get(`D3_MEDIA_URL`)
        }))
        .transform(`babelify`, {presets: [`es2015`]})
        .on(`log`, gutil.log)
        .on(`update`, () => {
            makeBundle();
        });

    return makeBundle();

    function makeBundle() {
        return browsePackage.bundle()
            .on(`error`, plugins.notify.onError({
                title: `Browserify Error`,
                message: `Error: <%= error.message %>`,
                sound: `Bottle`
            }))
            .pipe(source(`${config.buildfile}.js`))
            .pipe(buffer())
            .pipe(plugins.if(runType.build === `dist`, plugins.uglify()))
            .pipe(plugins.header(config.banner))
            .pipe(plugins.size({
                showFiles: true
            }))
            .pipe(gulp.dest(`${runType.build === `build` ? config.dest.build : config.dest.dist}/assets`))
            .pipe(plugins.livereload());
    }
});

gulp.task(`index`, [`env`], () => {
    return gulp.src(config.source.index)
        .pipe(plugins.jade({
            locals: {
                cssFile: `${config.buildfile}.css`,
                jsFile: `${config.buildfile}.js`,
                gaId: nconf.get(`GOOGLE_ANALYTICS_ID`),
                gaLocal: runType.build === `build`
            }
        }))
        .pipe(gulp.dest(runType.build === `build` ? config.dest.build : config.dest.dist))
        .pipe(plugins.livereload());
});

gulp.task(`watch`, () => {
    plugins.livereload.listen({
        port: config.express.reload
    });

    _.each([
        [config.source.less, [`styles`]],
        [config.source.root, [`root`]],
        [config.source.index, [`index`]],
        [`.eslintrc`, [`lint`]]
    ], toWatch => {
        gulp.watch(toWatch[0], toWatch[1]).on(`change`, onChange);
    });

    gulp.watch(config.source.js, event => {
        onChange(event);

        if (event.type !== `deleted`) {
            const report = linter.executeOnFiles([event.path]);

            if (report.errorCount + report.warningCount !== 0) {
                gutil.log(formatter(report.results));
            }
        }
    });

    function onChange(event) {
        gutil.log(`${gutil.colors.cyan(`[${_.capitalize(event.type)}]`)} ${event.path}`);
    }
});

gulp.task(`s3`, [`env`], () => {
    const publisher = plugins.awspublish.create({
        params: {
            Bucket: nconf.get(`S3_BUCKET`)
        },
        accessKeyId: nconf.get(`AWS_ID`),
        secretAccessKey: nconf.get(`AWS_SECRET`)
    });

    return gulp.src(`${config.dest.dist}/**/*`)
        .pipe(plugins.awspublish.gzip())
        .pipe(publisher.publish())
        .pipe(publisher.cache())
        .pipe(plugins.awspublish.reporter());
});

gulp.task(`bump`, () => {
    return bump();
});

gulp.task(`bump:minor`, () => {
    return bump(`minor`);
});

gulp.task(`bump:major`, () => {
    return bump(`major`);
});

gulp.task(`server`, server);
