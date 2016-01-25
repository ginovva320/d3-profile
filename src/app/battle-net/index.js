'use strict';

module.exports = require(`angular`)
    .module(`battle-net`, [])
    .factory(`D3APIService`, require(`./services/D3APIService`))
    .name;
