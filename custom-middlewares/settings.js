var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  const data = {
    projectName: 'swagger-mock-server-seed',
    author: 'terry chen'
  };
  res.send(data);
});

module.exports = router;