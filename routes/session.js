let router = require('express').Router();
let Mongo = require('../src/database/mongo');
let ObjectID = require('mongodb').ObjectID;
let {hashPassword} = require('../src/cipher/cipher');
const { check, validationResult } = require('express-validator');
let mongo = Mongo.getInstance();
let jwt = require('jsonwebtoken');

router.post('/nlogin', [

], async (req, res, next) => {
    let loginData = req.body;
    let user = await mongo.find('users', {email: loginData.email});
    if (user.length <= 0 && hashPassword(user[0].password)!== loginData.password) {
        res.status(400).json({status: 'error'});
        return;
    }

    let token = jwt.sign({
        id: user[0]._id,
        type: user[0].type,
        name: user[0].name
    }, 'academic-key');
    console.log(token);

    res.json({token: token});
});

router.post('/addUser/', [
    check('email').isEmail(),
    check('password').isLength({ min: 6 }),
    check('cpf').isLength({ min: 11, max: 11}),
    check('email').custom(async value => {
        let user = await mongo.find('users', {email: value});
        if(user.length > 0) await Promise.reject('user already registered.');
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({status: 'error'});
        return;
    }

    let userData = req.body;
    userData.password = hashPassword(userData.password);

    mongo.save('users', userData);



    res.send('ok');

});

router.post('/sign/:signKey', async (req, res) => {

});


module.exports = router;
