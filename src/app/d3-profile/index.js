'use strict';

require(`angular`)
    .module(`d3-profile`, [
        /* Angular modules */
        require(`angular-animate`),
        require(`angular-loading-bar`),

        `cfp.loadingBar`,
        /* Custom modules */
        require(`../battle-net`),

        /* 3rd party modules */
        require(`angular-loading-bar`),
        require(`angular-moment`),
        require(`angulartics`),
        require(`angulartics-google-analytics`),
        require(`angular-ui-router`)
    ])

    .config(require(`./config`))
    .config(require(`./route`))

    .controller(`HomeCtrl`, require(`./controllers/HomeCtrl`))
    .controller(`CareerCtrl`, require(`./controllers/CareerCtrl`))
    .controller(`HeroCtrl`, require(`./controllers/HeroCtrl`))

    .run(require(`./run`));
