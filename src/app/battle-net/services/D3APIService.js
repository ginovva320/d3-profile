'use strict';

module.exports = D3APIService;

/**
 * @ngInject
 */
function D3APIService($http) {

    return {
        getCareer,
        getHero
    };

    ////////////

    function getCareer(battletag) {
        return makeCall(`${process.env.BATTLE_NET_URL}d3/profile/${battletag}/`).then(data => {
            if (data.battleTag) {
                return data;
            } else {
                throw `Unknown response`;
            }
        });
    }

    function getHero(battletag, hero) {
        return makeCall(`${process.env.BATTLE_NET_URL}d3/profile/${battletag}/hero/${hero}`).then(data => {
            if (data.id) {
                return data;
            } else {
                throw `Unknown response`;
            }
        });
    }

    function makeCall(url) {
        return $http.jsonp(url, {
            params: {
                locale: `en_US`,
                apikey: process.env.BATTLE_NET_KEY,
                callback: `JSON_CALLBACK`
            }
        }).then(response => {
            if (response.data.code && response.data.reason) {
                throw response.data.reason;
            } else {
                return response.data;
            }
        }, () => {
            throw `Unable to retrieve your profile!`;
        });
    }
}
