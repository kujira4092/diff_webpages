const test = require('./modules/screenshot.js');
const createHTML = require('./modules/create-html');

test.screenshot().then((data)=>{
    return createHTML.createHTML(`./result/${data}/`);
}).then((res) => { 
    console.log(1); 
});
