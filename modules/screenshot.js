'use strict';

const { SSL_OP_NETSCAPE_CA_DN_BUG } = require('constants');

exports.screenshot = (async (device='pc',urlArr=['https://www.smbc-card.com/nyukai/card/numberless.jsp','https://www.smbc-card.com/nyukai/card/gold-numberless.jsp'],testDomain="https://www.smbc-card.com/")=>{
    const puppeteer = require('puppeteer');
    const fs = require('fs');
    require('date-utils');
    const date = new Date();
    const currentTime = date.toFormat('YYYY-MM-DD-HH24MISS');
    //console.log(currentTime);

    async function scrollToBottom(page, viewportHeight) {
        const getScrollHeight = () => { return Promise.resolve(document.documentElement.scrollHeight) };
        
        //evaluate 任意のjavascriptをpageで実行する
        let scrollHeight = await page.evaluate(getScrollHeight);
        let currentPosition = 0;
        let scrollNumber = 0;
        
        while (currentPosition < scrollHeight) {
            scrollNumber += 1;
            const nextPosition = scrollNumber * viewportHeight;
            await page.evaluate(function (scrollTo) {
                return Promise.resolve(window.scrollTo(0, scrollTo));
            }, nextPosition);
            //await page.waitForNavigation({waitUntil: 'load', timeout: 1000}).catch(e => console.log('timeout exceed. proceed to next operation'));
        
            currentPosition = nextPosition;
            //console.log(`scrollNumber: ${scrollNumber}`);
            //console.log(`currentPosition: ${currentPosition}`);
        
            scrollHeight = await page.evaluate(getScrollHeight);
            //console.log(`ScrollHeight ${scrollHeight}`);
        }
    }

    //check
    let chklist = [];
    urlArr.forEach(url=>{
        let _obj = new Object();
        _obj.base = url;
        _obj.compare = url.replace(/^(((https)|(http)):\/\/.*?)\//g,testDomain);
        _obj.filename = url.replace('.jsp','').replace(/^(((https)|(http)):\/\/.*?)\//g,'').replace(/\//g,'_');
        chklist.push(_obj);
    });

    console.log(chklist);

    let promiseList = [];
    //const browser = await puppeteer.launch();
    for(var i=0;i<chklist.length;i++){
        let obj = chklist[i];
        promiseList.push((async ()=>{
            const browser = await puppeteer.launch();
            const base = await browser.newPage();
    
            //width setup
            let _width = 0;
            if(device == 'pc'){
                _width = 1200;
            }
            else if(device == 'sp'){
                _width = 375;
            }
            let _height = 800;
            await base.setViewport({
                width: _width,
                height: _height
            });
    
            let type='base';
            let filepath='',dir='',filename='';
            
            filepath = obj[type];
            await base.goto(filepath);
            console.log(`Loading page ${filepath} ...`);
            await base.waitForNavigation({waitUntil:'load', timeout: 7500}).catch(e => {console.log('timeout');});
            dir = `./result/${currentTime}/${type}/screenshot/`;
            if(filepath.match(/.$/) == '/'){filepath = filepath+'index';}
            filename = `${filepath.replace('.jsp','').replace(/^(((https)|(http)):\/\/.*?)\//g,'').replace(/\//g,'-')}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await scrollToBottom(base,_height);
            await base.screenshot({
                path:`${dir}${filename}.png`,
                fullPage: true
            });

            const compare = await browser.newPage();
            await compare.bringToFront();
            await compare.setViewport({
                width: _width,
                height: _height
            });
            type = 'compare';

            filepath = obj[type];
            await compare.goto(filepath);
            console.log(`Loading page ${filepath} ...`);
            await compare.waitForNavigation({waitUntil:'load', timeout: 7500}).catch(e => {console.log('timeout');});
            dir = `./result/${currentTime}/${type}/screenshot/`;
            if(filepath.match(/.$/) == '/'){filepath = filepath+'index';}
            filename = `${filepath.replace('.jsp','').replace(/^(((https)|(http)):\/\/.*?)\//g,'').replace(/\//g,'-')}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await scrollToBottom(compare,_height);
            await compare.screenshot({
                path:`${dir}${filename}.png`,
                fullPage: true
            });
            await browser.close();

            return true;
        })());
    };

    //console.log(promiseList);
    await Promise.all(promiseList);
    console.log(`Capture completed!`);
    return currentTime;
});