'use strict';

module.exports = HomeCtrl;

/**
 * @ngInject
 */
function HomeCtrl($state) {
    const vm = this;

    vm.goToCareer = goToCareer;

    /////////////

    function goToCareer() {
        vm.error = null;

        if (vm.form.$valid) {
            $state.go(`d3.profile.career`, {
                battletag: vm.battletag.replace(/#(\d+)$/, `-$1`)
            });
        } else {
            vm.error = `Please enter your full BattleTag`;
        }
    }

}
