// fs 讀寫文件

const fs = require('fs')
let RouterFile = require('express').Router()

// fs 設定讀取之資料
fs
    // 同步讀取資料(__dirname -> 資料夾名稱)
    .readdirSync(__dirname)
    // 過濾文件(這裡為執行[非index.js]文件)
    .filter((file) =>
        file !== 'index.js'
    )
    // 讀取資料夾中每個資料
    .forEach((file) => {
        console.log(`- ${file}`)
        let RequireFile = require(`./${file}`)
        RouterFile.use(`/${file}`, RequireFile)
    })

let userRouter = require('./router')
RouterFile.use('/', userRouter)

module.exports = RouterFile