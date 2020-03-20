let express = require('express');
let router = express.Router();
let Mongo = require('../src/database/mongo');
let ObjectID = require('mongodb').ObjectID;

let mongo = Mongo.getInstance();

router.post('/login', async (req, res, next) => {
    //todo validation

    if (!req.body.email || !req.body.password) {
        res.json({
            status: 'error'
        });
    } else {
        let result = await mongo.find('users', {email: req.body.email});

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
        let user = await mongo.find('users', {'_id': req.body.user._id});

        delete req.body.user._id;

        for (const key of Object.keys(req.body.user)) {
            user[0][key] = req.body.user[key];
        }
        await mongo.update('users', {_id: user[0]._id}, user[0]);
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
    let result = await mongo.find('users', {type: parseInt(req.params.userType)});
    res.json(result);
});


router.get('/getExam', async (req, res, next) => {
    let result = await mongo.find('exams', {});
    res.json(result[0]);
});

router.post('/updateExam', async (req, res, next) => {
    //todo validation

    if (req.body.exam._id) {
        req.body.exam._id = ObjectID(req.body.exam._id);
        await mongo.update('exams', {_id: req.body.exam._id}, req.body.exam);
        res.json({
            status: 'ok'
        });
    } else {
        await mongo.save('exams', req.body.exam);
        res.json({
            status: 'ok'
        });
    }
});


module.exports = router;
