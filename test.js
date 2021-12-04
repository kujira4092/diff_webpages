const test = require('./modules/screenshot.js');
const createHTML = require('./modules/create-html');

test.screenshot().then((data)=>{
    console.log(data);
    return createHTML.createHTML(`./result/${data}/`);
});
