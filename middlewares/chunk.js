const express = require('express');
const router = express.Router();

let chunkParser = express.json({limit: '2mb'});
let normalParser = express.json();

router.use((req, res, next) => {
    if(req.headers['data-type'] === 'chunk'){
        chunkParser(req, res, next);
    }else {
        normalParser(req, res, next);
    }
});






module.exports = router;
