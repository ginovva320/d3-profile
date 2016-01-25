'use strict';

module.exports = HeroCtrl;

/**
 * @ngInject
 */
function HeroCtrl(D3APIService, battletag, hero) {
    const vm = this;

    init();

    /////////////

    function init() {
        vm.loaded = false;

        D3APIService
            .getHero(battletag, hero)
            .then(hero => {
                vm.hero = hero;
            })
            .catch(error => {
                vm.error = error;
            })
            .finally(() => {
                vm.loaded = true;
            });
    }
}
