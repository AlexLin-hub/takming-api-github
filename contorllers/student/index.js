// API方法
const { student } = require('../../models/user')
const time = require('../../tools/time');

function checkROOT(SID) {
    return !SID.toUpperCase().includes('ROOT')
}

module.exports = {
    // 驗證學生
    async checkSID(req, res, next) {
        const { method, body, params, query, headers, } = req
        const { locals } = res
        console.log(`${time.now()}:[${method}]驗證使用者`)
        let Response = {}
        try {
            const { sid } = headers || {}
            if (sid && checkROOT(sid)) {
                const SID = sid.toUpperCase()
                const userCheck = await student.findOne({ where: { SID, isDelete: null } })
                if (!userCheck) {
                    Response['returnCode'] = '9001'
                    Response['returnMessage'] = '此用戶無法正常操作，或輸入SID錯誤'
                    res.send(Response)
                }
                else {
                    locals.SID = userCheck['SID']
                    next()
                }
            } else {
                Response['returnCode'] = '9001'
                Response['returnMessage'] = '此用戶無法正常操作，或輸入SID錯誤'
                res.send(Response)
            }
        } catch (error) {
            Response['returnCode'] = '9000'
            Response['returnMessage'] = `Error: ${error}`

            console.log(`${time.now()}:[${Response['returnCode']}]-${Response['returnMessage']}`)
            res.send(Response)
        }
    },
    // 學生登入
    async login(req, res, next) {
        const { method, body, params, query, headers, } = req
        console.log(`${time.now()}:[${method}]學生登入`)
        let Response = {}
        try {
            let { SID } = body || {}
            if (SID) {
                SID = SID.toUpperCase()
                if (checkROOT(SID)) {
                    const userCheck = await student.findOne({ where: { SID, isDelete: null } })

                    if (userCheck) {
                        Response['returnCode'] = '0000'
                        Response['returnMessage'] = `登入成功，${userCheck['name']}歡迎你回來。`
                        Response['data'] = { SID, name: userCheck['name'] }
                    }
                    else {
                        Response['returnCode'] = '2001'
                        Response['returnMessage'] = '查無資料：尚未註冊'
                        Response['data'] = { SID }
                    }
                } else {
                    Response['returnCode'] = '9001'
                    Response['returnMessage'] = '此用戶無法正常操作，或輸入SID錯誤'
                }
            } else {
                Response['returnCode'] = '1001'
                Response['returnMessage'] = '資料遺漏:SID'
            }
            res.send(Response)
        } catch (error) {
            Response['returnCode'] = '9000'
            Response['returnMessage'] = `Error: ${error}`

            console.log(`${time.now()}:[${Response['returnCode']}]-${Response['returnMessage']}`)
            res.send(Response)
        }
    },
    // 學生註冊
    async signIn(req, res, next) {
        const { method, body, params, query, headers, } = req
        console.log(`${time.now()}:[${method}]學生註冊`)
        let Response = {}
        try {
            let { SID, name } = body || {}
            if (checkROOT(SID)) {
                if (SID && name) {
                    SID = SID.toUpperCase()
                    const userCheck = await student.findOne({ where: { SID, isDelete: null } })
                    if (!userCheck) {
                        const createTime = updateTime = time.now()
                        const createDB = { SID, name, createTime, updateTime }
                        await student.create(createDB)

                        Response['returnCode'] = '0000'
                        Response['returnMessage'] = `註冊成功，${name}歡迎你加入`
                        Response['data'] = { SID, name }
                    } else {
                        Response['returnCode'] = '0000'
                        Response['returnMessage'] = `歡迎回來，${userCheck['name']}`
                        Response['data'] = { SID, name: userCheck['name'] }
                    }
                } else {
                    Response['returnCode'] = '1001'
                    Response['returnMessage'] = '資料遺漏:SID,name'
                }
            } else {
                Response['returnCode'] = '9001'
                Response['returnMessage'] = '此用戶無法正常操作，或輸入SID錯誤'
            }
            res.send(Response)
        } catch (error) {
            Response['returnCode'] = '9000'
            Response['returnMessage'] = `Error: ${error}`

            console.log(`${time.now()}:[${Response['returnCode']}]-${Response['returnMessage']}`)
            res.send(Response)
        }
    },
}
