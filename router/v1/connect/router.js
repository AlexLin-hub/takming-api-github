// 設定API路徑
const connect = require('../../../contorllers/connect')
const student = require('../../../contorllers/student')
const classroom = require('../../../contorllers/classroom')
let connectRouter = require('express').Router()

// api測試
connectRouter.get('/', student.checkSID, classroom.checkClassroom, connect.test)
connectRouter.post('/', student.checkSID, classroom.checkClassroom, connect.test)
connectRouter.put('/', student.checkSID, classroom.checkClassroom, connect.test)
connectRouter.delete('/', student.checkSID, classroom.checkClassroom, connect.test)


connectRouter.get('/:connectParams', student.checkSID, classroom.checkClassroom, connect.test)
connectRouter.post('/:connectParams', student.checkSID, classroom.checkClassroom, connect.test)
connectRouter.put('/:connectParams', student.checkSID, classroom.checkClassroom, connect.test)
connectRouter.delete('/:connectParams', student.checkSID, classroom.checkClassroom, connect.test)

module.exports = connectRouter