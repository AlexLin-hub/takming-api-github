// 設定API路徑
const student = require('../../../contorllers/student')
let studentRouter = require('express').Router()
const log = require('../../../contorllers/student/log')

// 登入使用者
studentRouter.post('/login', student.login)

// 註冊使用者
studentRouter.post('/sign-in', student.signIn)

// 獲取log
studentRouter.get('/log', log.getLog)


module.exports = studentRouter