'use strict';

module.exports = CareerCtrl;

/**
 * @ngInject
 */
function CareerCtrl(D3APIService, battletag) {
    const vm = this;

    init();

    /////////////

    function init() {
        vm.loaded = false;

        D3APIService
            .getCareer(battletag)
            .then(career => {
                vm.career = career;
            })
            .catch(error => {
                vm.error = error;
            })
            .finally(() => {
                vm.loaded = true;
            });
    }
}
