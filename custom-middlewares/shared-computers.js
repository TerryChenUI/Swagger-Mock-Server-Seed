var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    const db = req.app.db;
    const data = [
        {
            id: '1',
            computerName: 'test-computer-1'
        },
        {
            id: '2',
            computerName: 'test-computer-2'
        }
    ];
    res.send(data);
});

module.exports = router;