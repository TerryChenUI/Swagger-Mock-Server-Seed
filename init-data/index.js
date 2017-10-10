/**
 * Config tables
 * name: api/v1/{name}
 * key:  api/v1/{name}/{key} | optional
 * data: array or string
 */
module.exports = [{
  name: 'sharedcontacts',
  key: 'id',
  data: require('./shared-contacts.json')
}];