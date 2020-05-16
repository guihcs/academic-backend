const router = require('express').Router();
let Mongo = require('../src/database/mongo').getInstance();
let ObjectID = require('mongodb').ObjectID;

router.use(async (req, res, next) => {

    // console.log(req.headers);
    next();
});






module.exports = router;
