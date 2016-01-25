'use strict';

module.exports = run;

/**
 * @ngInject
 */
function run($rootScope, $state, $stateParams, $log, cfpLoadingBar) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on(`$stateChangeStart`, onStateChangeStart);
    $rootScope.$on(`$stateChangeSuccess`, onStateChangeSuccess);
    $rootScope.$on(`$stateChangeCancel`, onStateChangeCancel);
    $rootScope.$on(`$stateChangeError`, onStateChangeError);

    //////////////

    function onStateChangeStart(event, toState) {
        if (toState.resolve) {
            cfpLoadingBar.start();
        }
    }

    function onStateChangeSuccess(event, toState) {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        if (toState.resolve) {
            cfpLoadingBar.complete();
        }
    }

    function onStateChangeCancel(event, toState) {
        if (toState.resolve) {
            cfpLoadingBar.complete();
        }
    }

    function onStateChangeError(event, toState, toParams, fromState, fromParams, error) {
        if (toState.resolve) {
            cfpLoadingBar.complete();
        }
        if (error.hasOwnProperty(`state`)) {
            $state.go(error.state.name, error.state.params);
        } else {
            $log.error(error);
        }
    }
}
