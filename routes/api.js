let express = require('express');
let router = express.Router();
let Mongo = require('../src/database/mongo');

let mongo = Mongo.getInstance();

router.post('/login', function(req, res, next) {
    //todo validation
    let result = mongo.find('users', {login: req.body.login});
    if (result.passive === req.body.password) res.json(result);
    else {
        res.json({
           status: 'error'
        });
    }
});

router.post('/insertUser', function(req, res, next) {
    //todo validation
    mongo.save('users', req.body.user);
    res.json({
        status: 'ok'
    });
});

router.post('/deleteUser', function(req, res, next) {
    //todo validation
    mongo.delete('users', {_id: req.body.user._id});
    res.json({
        status: 'ok'
    });
});

router.post('/editUser', function(req, res, next) {
    //todo validation
    mongo.update('users', {_id: req.body.user._id}, req.body.user);
    res.json({
        status: 'ok'
    });
});

router.post('/getUsers', function(req, res, next) {
    //todo validation
    let result = mongo.find('users', {});
    res.json(result);
});

router.get('/', (req, res) => {
   res.send('ok');
});

module.exports = router;
