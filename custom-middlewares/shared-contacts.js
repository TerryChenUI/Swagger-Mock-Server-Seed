var express = require('express');
var router = express.Router();

router.get('/sharedcontacts', (req, res, next) => {
    const db = req.app.db;
    res.send('test custom api config successfully');
});

module.exports = router;