'use strict';

const _   = require(`lodash`),
      pkg = require(`../../package.json`);

module.exports = {
    buildfile: `${pkg.name}-${pkg.version}-${Date.now()}`,
    banner: _.template(
        `/**
          * <%= pkg.name %> - <%= pkg.description %>
          * @version v<%= pkg.version %>
          * @link <%= pkg.homepage %>
          * @license <%= pkg.license %>
          */
        `)({pkg}),
    entry: {
        js: `src/app/d3-profile/index.js`,
        less: `src/less/main.less`
    },
    source: {
        js: `src/**/*.js`,
        less: `src/less/**/*.less`,
        index: `src/index.jade`,
        root: [`src/favicon.ico`]
    },
    dest: {
        build: `build`,
        dist: `dist`
    },
    express: {
        port: 3999,
        reload: 35728
    }
};
