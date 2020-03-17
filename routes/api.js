let express = require('express');
let router = express.Router();
let Mongo = require('../src/database/mongo');
let ObjectID = require('mongodb').ObjectID;

let mongo = Mongo.getInstance();

router.post('/login', async (req, res, next) => {
    //todo validation
    let result = await mongo.find('users', {login: req.body.login});

    if (result[0].password === req.body.password) {
        res.json({
            status: 'ok',
            session: result[0]
        });
    } else {
        res.json({
            status: 'error'
        });
    }
});

router.post('/insertUser', async (req, res, next) => {
    //todo validation
    await mongo.save('users', req.body.user);
    res.json({
        status: 'ok'
    });
});

router.post('/deleteUser', async (req, res, next) => {
    //todo validation
    let query = {};
    query[req.body.key] = req.body.value;
    await mongo.delete('users', query);
    res.json({
        status: 'ok'
    });
});

router.post('/updateUser', async (req, res, next) => {
    //todo validation
    if (req.body.user._id) {
        req.body.user._id = ObjectID(req.body.user._id);
        await mongo.update('users', {_id: req.body.user._id}, req.body.user);
        res.json({
            status: 'ok'
        });
    } else {
        await mongo.save('users', req.body.user);
        res.json({
            status: 'ok'
        });
    }

});

router.get('/getUsers/:userType', async (req, res, next) => {
    //todo validation
    let result = await mongo.find('users', {type: req.params.userType});
    res.json(result);
});


module.exports = router;
