let router = require('express').Router();
let Mongo = require('../src/database/mongo');
let ObjectID = require('mongodb').ObjectID;
let {hashPassword} = require('../src/cipher/cipher');
const { check, validationResult } = require('express-validator');
let mongo = Mongo.getInstance();
let jwt = require('jsonwebtoken');

const gsign = require('../src/mail/gmail');
const {google} = require('googleapis');
const buildEmail = require('../src/mail/mailbuilder');



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

router.post('/nsign', [
    check('email').isEmail(),
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

    let result = await mongo.save('users', userData);
    let gmailAuth = await gsign();
    const gmail = google.gmail({version: 'v1', auth: gmailAuth});

    let configLink = `http://localhost:4200/password/${result.id}`;
    let bodyMessage = `<h1>Academic</h1>
<p>Access this link to create a password:</p>
<a href="${configLink}">${configLink}</a>`;

    let base64EncodedEmail = buildEmail({
        from: 'Academic <testacademic7@gmail.com>',
        to: `${userData.email.split(' ')[0]} <${userData.email}>`,
        subject: 'Create Password',
        sender: 'testacademic7@gmail.com',
        content: 'text/html; charset=UTF-8',
        body:  bodyMessage
    });

    let request = gmail.users.messages.send({
        'userId': 'me',
        'resource': {
            'raw': base64EncodedEmail
        }
    });

    res.send('ok');
});

router.post('/sign/:id', [
    check('password').isLength({ min: 6 })
], async (req, res) => {
    let userData = req.body;
    userData.password = hashPassword(userData.password);
    mongo.update('users', req.params.id, {
       password: userData.password
    });

    res.json({status: 'ok'});
});


async function mail(data){

}


module.exports = router;
