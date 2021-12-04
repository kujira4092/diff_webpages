'use strict';

exports.screenshot = (async (device='pc',baseUrlArr=['https://www.smbc-card.com/nyukai/card/numberless.jsp','https://www.smbc-card.com/nyukai/card/gold-numberless.jsp'],compareUrlArr=['https://www.smbc-card.com/nyukai/card/numberless.jsp','https://www.smbc-card.com/nyukai/card/gold-numberless.jsp'])=>{
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
    return (async ()=>{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        //width setup
        let _width = 0;
        if(device == 'pc'){
            _width = 1200;
        }
        else if(device == 'sp'){
            _width = 375;
        }
        let _height = 800;
        await page.setViewport({
            width: _width,
            height: _height
        });

        var type = 'base';

        for(let i=0;i<baseUrlArr.length;i++){
            let url = baseUrlArr[i];
            await page.goto(url);
            console.log(`Loading page ${url} ...`);
            //networkidle2 : connection<2,time<500ms
            await page.waitForNavigation({waitUntil:'load', timeout: 5000}).catch(e => {});
            let dir = `./result/${currentTime}/${type}/screenshot/`;
            if(url.match(/.$/) == '/'){url = url+'index';}
            let filename = `${url.replace('.jsp','').replace(/^(((https)|(http)):\/\/.*?)\//g,'').replace(/\//g,'-')}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await scrollToBottom(page,_height);
            await page.screenshot({
                path:`${dir}${filename}.png`,
                fullPage: true
            });
            console.log(`Complete!`);
        }

        type = 'compare';
        //const authdata = JSON.stringify(fs.readFileSync('./auth.json'));

        for(let i=0;i<compareUrlArr.length;i++){
            let url = compareUrlArr[i];
            console.log(`Loading page ${url} ...`);
            await page.authenticate({username: 'username',password: 'password'});
            await page.goto(url);
            //networkidle2 : connection<2,time<500ms
            await page.waitForNavigation({waitUntil:'load', timeout: 5000}).catch(e => {});
            let dir = `./result/${currentTime}/${type}/screenshot/`;
            if(url.match(/.$/) == '/'){url = url+'index';}
            let filename = `${url.replace('.jsp','').replace(/^(((https)|(http)):\/\/.*?)\//g,'').replace(/\//g,'-')}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await scrollToBottom(page,_height);
            await page.screenshot({
                path:`${dir}${filename}.png`,
                fullPage: true
            });
            console.log(`Complete!`);
        }
        await browser.close();
        console.log(`Capture completed!`);

        return currentTime;
    })();
});