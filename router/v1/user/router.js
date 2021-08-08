// 設定API路徑
const user = require('../../../contorllers/user')
const student = require('../../../contorllers/student')
const classroom = require('../../../contorllers/classroom')
const log = require('../../../contorllers/student/log')


let userRouter = require('express').Router()

// 獲取使用者
userRouter.get('/', student.checkSID, classroom.checkClassroom, user.user, log.log)
userRouter.get('/:UID', student.checkSID, classroom.checkClassroom, user.user, log.log)


// 新增使用者
userRouter.post('/', student.checkSID, classroom.checkClassroom, user.user, log.log)

// 更新使用者
userRouter.put('/', student.checkSID, classroom.checkClassroom, user.user, log.log)
userRouter.put('/:UID', student.checkSID, classroom.checkClassroom, user.user, log.log)

// 刪除使用者
userRouter.delete('/', student.checkSID, classroom.checkClassroom, user.user, log.log)
userRouter.delete('/:UID', student.checkSID, classroom.checkClassroom, user.user, log.log)

module.exports = userRouter