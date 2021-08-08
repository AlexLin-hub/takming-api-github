// 主要執行檔
// express (Node.js與web之間應用)
// cors 跨域跨來源應用
// config 使用config.js的資料庫連線資訊
// app 整合express服務
// fs 文件的讀寫服務
// path 處理文件路徑服務(path.relative(from,to)-->絕對路徑)
const express = require('express')
const cors = require('cors')
const config = require('./config/config')
const app = express()
const fs = require('fs')
const path = require('path')

// app.use 引用express服務
// express.json() 標頭含content-type:application/json的電文解析到req.body
// express.urlencoded() 標頭含content-type:application/x-www-form-urlencoded的電文解析到req.body
// cors() 跨域應用
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

// 讀取router.js
let apiRouter = require('./router')
app.use('/api', apiRouter)


const helloWorld = require('./tools/helloWorld')

// 上傳啟動Server執行index
app.use(express.static("dist"));
app.get('*', function (req, res) {
    let html = fs.readFileSync(path.resolve(__dirname, "./dist/index.html"), 'UTF-8');
    res.send(html)
});

// 監聽config.port -> 1201
app.listen(config.port)
console.log(`[${config.port}]${helloWorld.helloworld()},Server Started...`)
