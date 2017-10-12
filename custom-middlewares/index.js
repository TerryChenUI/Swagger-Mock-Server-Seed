/**
 * Custom api
 */

const config = require('../config');

module.exports = (app) => {
    // overload swagger api definition
    app.use(`${config.prefixApi}/sharedcomputers`, require('./shared-computers'));

    // other api definition
    app.use('/api/v2/settings', require('./settings'));
};