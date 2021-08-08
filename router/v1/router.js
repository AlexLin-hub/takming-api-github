// 設定API路徑
const user = require('../../contorllers/user')
const student = require('../../contorllers/student')
const classroom = require('../../contorllers/classroom')
const log = require('../../contorllers/student/log')

let userRouter = require('express').Router()

// 獲取使用者
userRouter.get('/get-user', student.checkSID, classroom.checkClassroom, user.user, log.log)
userRouter.post('/get-user', student.checkSID, classroom.checkClassroom, user.user, log.log)
// 新增使用者
userRouter.post('/add-user', student.checkSID, classroom.checkClassroom, user.user, log.log)
// 更新使用者
userRouter.put('/update-user', student.checkSID, classroom.checkClassroom, user.user, log.log)
userRouter.post('/update-user', student.checkSID, classroom.checkClassroom, user.user, log.log)
// 刪除使用者
userRouter.delete('/delete-user', student.checkSID, classroom.checkClassroom, user.user, log.log)
userRouter.post('/delete-user', student.checkSID, classroom.checkClassroom, user.user, log.log)

module.exports = userRouter