'use strict';
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/',express.static(path.join(__dirname,'public')));

app.post('/resemble/test.html',(req,res)=>{
    // アクセスログ
    console.log(req.method, req.url, req.ip);

    // bodyを表示
    console.log(req.body);
    const json = req.body;
    (()=>{
        console.log(req.body);
        res.sendFile(`${__dirname}/public/${req.originalUrl}`);
    })();

});

app.listen(port,()=>{
    console.log(`listening at http://localhost:${port}`);
});