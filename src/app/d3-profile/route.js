'use strict';

module.exports = route;

/**
 * @ngInject
 */
function route($stateProvider) {
    $stateProvider
        .state(`d3`, {
            abstract: true,
            views: {
                '': {
                    template: require(`./templates/base.tpl.jade`)
                }
            }
        })
        .state(`d3.home`, {
            url: `/`,
            views: {
                'content@d3': {
                    template: require(`./templates/home.tpl.jade`),
                    controller: `HomeCtrl as vm`
                }
            }
        })
        .state(`d3.profile`, {
            url: `/:battletag`,
            abstract: true,
            views: {
                'content@d3': {
                    template: require(`./templates/profile.tpl.jade`),
                    controller: `CareerCtrl as vm`
                }
            },
            resolve: {
                battletag($stateParams) {
                    return $stateParams.battletag;
                }
            }
        })
        .state(`d3.profile.career`, {
            url: ``,
            template: require(`./templates/career.tpl.jade`)
        })
        .state(`d3.profile.hero`, {
            url: `/:hero`,
            template: require(`./templates/hero.tpl.jade`),
            controller: `HeroCtrl as h`,
            resolve: {
                hero($stateParams) {
                    return $stateParams.hero;
                }
            }
        });
}
