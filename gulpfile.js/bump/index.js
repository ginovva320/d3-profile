'use strict';

const Q                     = require(`q`),
      gulp                  = require(`gulp`),
      conventionalChangelog = require(`gulp-conventional-changelog`),
      semver                = require(`semver`),
      fs                    = require(`fs`),
      gutil                 = require(`gulp-util`),
      pkg                   = require(`../../package.json`),
      shrinkwrap            = require(`../../npm-shrinkwrap.json`),
      exec                  = require(`child-process-promise`).exec;

function bump(type) {
    pkg.version        = semver.inc(pkg.version, type || `patch`);
    shrinkwrap.version = pkg.version;

    return Q.all([
        Q.nfcall(fs.writeFile, `package.json`, JSON.stringify(pkg, null, 2)),
        Q.nfcall(fs.writeFile, `npm-shrinkwrap.json`, JSON.stringify(shrinkwrap, null, 2))
    ]).thenResolve(pkg.version);
}

function changelog(version) {
    return Q.Promise(resolve => {
        gulp
            .src(`CHANGELOG.md`, {
                buffer: false
            })
            .pipe(conventionalChangelog({
                    preset: `angular`
                },
                {
                    currentTag: version
                }))
            .pipe(gulp.dest(`./`))
            .on(`end`, resolve);
    });
}

function commit(version) {
    return exec(`git commit CHANGELOG.md package.json npm-shrinkwrap.json -m "chore(build): v${version}"`)
        .then(out => {
            if (out) {
                gutil.log(out.stdout);
            }
        }, gutil.log);
}

module.exports = function(type) {
    return bump(type)
        .tap(changelog)
        .then(commit);
};
