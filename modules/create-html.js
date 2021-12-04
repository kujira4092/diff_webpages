'use strict';
exports.createHTML = (async (dirpath='./result/2021-11-23-105011/')=>{
    const fs = require('fs');
    const glob = require('glob');
    const path = require('path');
    const resemble = require('resemblejs');

    const htmltmp = '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Document</title><style>*,*::after,*::before {-webkit-box-sizing:border-box;box-sizing:border-box;margin:0;padding:0;}body{width:100%;}main{width:100%;max-width:1200px;margin: 0 auto;overflow:hidden;text-align:center;}h1{margin-bottom:20px;}</style></head><body><h1>差分結果 : {{resultText}}</h1><img src="data:image/{{datatype}};base64,{{dataframe}}" alt="diffimage" id="diffimage"></body></html>';

    const option = {
        absolute: true
    };
    //get filelist
    const baseImageArr = glob.sync(`${dirpath}base/screenshot/*`,option);
    const compImageArr = glob.sync(`${dirpath}compare/screenshot/*`,option);

    let isMisMatch = "";
    const outputPath = `${dirpath}diff/html/`;

    for(let i=0;i<baseImageArr.length;i++){
        let basefile_basename = path.basename(baseImageArr[i],path.extname(baseImageArr[i]));
        for(let j=0;j<compImageArr.length;j++){
            let comparefile_basename = path.basename(compImageArr[j],path.extname(compImageArr[j]));
            if(basefile_basename == comparefile_basename){
                const baseImage = fs.readFileSync(baseImageArr[i]);
                const compareImage = fs.readFileSync(compImageArr[j]);
                resemble(baseImage).compareTo(compareImage).onComplete((data) =>{
                    if (!fs.existsSync(`${dirpath}diff/img/`)) {
                        fs.mkdirSync(`${dirpath}diff/img/`, { recursive: true });
                    }
                    const file = `${dirpath}diff/img/${basefile_basename}.png`;
                    fs.writeFileSync(file,data.getBuffer());
                    if(data.misMatchPercentage >= 0.01 ){
                        isMisMatch = '差分あり';
                    }
                    else{
                        isMisMatch = '差分なし';
                    }
                    var datatype = 'png';
                    switch (path.extname(file).toLowerCase()) {
                        case '.png':
                            datatype = 'png';
                            break;
                        case '.jpg':
                            datatype = 'jpeg';
                            break;
                        case '.jpeg':
                            datatype = 'jpeg';
                            break;
                        default:
                            break;
                    }
                    const src = fs.readFileSync(file,{encoding: 'base64'})
                    const output = htmltmp.replace('{{dataframe}}',src).replace('{{datatype}}',datatype).replace('{{resultText}}',isMisMatch);
                    if (!fs.existsSync(outputPath)) {
                        fs.mkdirSync(outputPath, { recursive: true });
                    }
                    fs.writeFileSync(`${outputPath}${path.basename(file,path.extname(file))}.html`,output);
                    console.log(`output -> ${path.basename(file,path.extname(file))}.html`)
                });
                break;
            }
        }
    }

    return true;
});