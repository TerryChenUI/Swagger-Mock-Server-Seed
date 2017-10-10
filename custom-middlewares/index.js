/**
 * Custom api config in here
 */
module.exports = (app) => {  
    app.use('/api/v2', require('./shared-contacts.js'));
};