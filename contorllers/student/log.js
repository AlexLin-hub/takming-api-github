// API方法
const { log } = require('../../models/user')
const time = require('../../tools/time');
const { Op } = require("sequelize");

module.exports = {
    async log(req, res) {
        console.log(`${time.now()}:寫入LOG`)
        const { locals } = res
        const { logDB } = locals
        try {
            await log.create(logDB)
        } catch (error) {
            console.log(`${time.now()}:[${error}`)
        }
    },
    async getLog(req, res) {
        console.log(`${time.now()}:獲取LOG`)
        const { query } = req
        const Response = {}
        try {
            const { CID, date } = query
            if (date) {
                if (CID) {
                    const logRes = await log.findAll({ where: { CID, time: { [Op.like]: `${date}%` } }, order: [['id', 'DESC']] })
                    const logArray = logRes.map((v) => { return { id: v['id'], CID: v['CID'], SID: v['SID'], request: JSON.parse(v['req']), response: JSON.parse(v['res']), returnCode: JSON.parse(v['res'])['returnCode'], time: v['time'] } })
                    Response['data'] = { log: logArray }
                    Response['returnCode'] = '0000'
                    Response['returnMessage'] = `成功`
                    res.send(Response)
                    return
                }
                const logRes = await log.findAll({ where: { time: { [Op.like]: `${date}%` } }, order: [['id', 'DESC']] })
                const logArray = logRes.map((v) => { return { id: v['id'], CID: v['CID'], SID: v['SID'], request: JSON.parse(v['req']), response: JSON.parse(v['res']), returnCode: JSON.parse(v['res'])['returnCode'], time: v['time'] } })
                Response['data'] = { log: logArray }
                Response['returnCode'] = '0000'
                Response['returnMessage'] = `成功`
                res.send(Response)
                return
            }
            Response['returnCode'] = '1001'
            Response['returnMessage'] = '操作失敗，資料遺漏：[date]'
            res.send(Response)
            return
        } catch (error) {
            Response['returnCode'] = '9000'
            Response['returnMessage'] = `Error: ${error}`
            console.log(`${time.now()}:[${error}`)
            res.send(Response)
        }
    }
}