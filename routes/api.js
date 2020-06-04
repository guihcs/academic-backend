let express = require('express');
let router = express.Router();
let multer = require('multer');
let upload = multer({ dest: '~/academic/uploads/', limits: { fieldSize: 100 * 1024 * 1024 }}).single('file');
let Mongo = require('../src/database/mongo');
let ObjectID = require('mongodb').ObjectID;
let {Readable, Writable} = require('stream');
let fs = require('fs');

let mongo = Mongo.getInstance();


router.post('/file', async (req, res) => {
    
    let file = req.body;
    file.metadata.status = 'incomplete';
    let opRes = await mongo.save('files.files', file);
    res.json({status: 'ok', id: opRes.id});
});

router.post('/chunk', async (req, res) => {
    let chunk = req.body;
    chunk.files_id = new ObjectID(chunk.files_id);
    let opRes = await mongo.save('files.chunks', chunk);
    res.json({status: 'ok'});
});

router.get('/chunk', async (req, res) => {
    
    let query = req.query;
    query.n = parseInt(query.n);
    let chunks = await mongo.find('files.chunks', {files_id: new ObjectID(query.id), n: query.n});

    res.json({status: 'ok', chunk: chunks[0]});
});


router.post('/login', async (req, res, next) => {
    //todo validation

    if (!req.body || !req.body.email || !req.body.password) {
        res.json({
            status: 'error'
        });
	
    } else {
        let result = await mongo.find('users', {email: req.body.email});
        if (result.length <= 0) {
            res.json({
                status: 'error'
            });
		return;
        }

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
        await mongo.upsert('users', {_id: user[0]._id}, user[0]);
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


router.get('/getUser/:id', async (req, res, next) => {

    let result = await mongo.find('users', {_id: ObjectID(req.params.id)});
    res.json(result[0]);
});


router.get('/getExam', async (req, res, next) => {
    let result = await mongo.find('exams', {});
    res.json(result[0]);
});

router.post('/updateExam', async (req, res, next) => {
    //todo validation

    if (req.body.exam._id) {
        req.body.exam._id = ObjectID(req.body.exam._id);
        await mongo.upsert('exams', {_id: req.body.exam._id}, req.body.exam);
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

router.post('/createCourse', async (req, res) => {

    await mongo.save('courses', req.body);

    res.json({
        status: 'ok'
    });
});

router.post('/createSubject', async (req, res) => {

    await mongo.save('subjects', req.body);

    res.json({
        status: 'ok'
    });
});

router.post('/createClass', async (req, res) => {

    await mongo.save('classes', req.body);

    res.json({
        status: 'ok'
    });
});


router.get('/courses', async (req, res) => {

    let result = await mongo.find('courses', {});

    return res.json(result);
});

router.get('/subjects', async (req, res) => {

    let result = await mongo.find('subjects', {});

    return res.json(result);
});

router.get('/classes', async (req, res) => {

    let result = await mongo.find('classes', {});

    return res.json(result);
});



router.post('/persist/:collection', async (req, res) => {
    
    await mongo.save(req.params.collection, req.body);
    res.json({status: 'ok'});
});

router.get('/all/:collection', async (req, res) => {
    let result = await mongo.find(req.params.collection, {});

    return res.json(result);
});



router.post('/update/:collection', async (req, res) => {
    let data = req.body;
    delete data.value._id;
    await mongo.update(req.params.collection, data.id, data.value);

    return res.json({status: 'ok'});
});

router.delete('/delete/:collection/:id', async (req, res) => {
    await mongo.delete(req.params.collection, {'_id': ObjectID(req.params.id)});
    return res.json({status: 'ok'});
});


router.get('/count/:collection', async (req, res) => {
    let result = await mongo.stats(req.params.collection);

    res.json({
        count: result.count
    });
    
});


router.get('/page/:collection/:min/:max', async (req, res) => {
    let params = req.params;
    params.min = parseInt(params.min);
    params.max = parseInt(params.max);
    
    let results = await mongo.page(params.collection, params.min, params.max);
    res.json(results);
});




router.get('/:collection/:id', async (req, res) => {

    
    let result = await mongo.find(req.params.collection, {
        '_id': ObjectID(req.params.id)
    });

    return res.json(result);
});

module.exports = router;
