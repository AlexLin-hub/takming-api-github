// API方法
const { } = require('../../models/user')

module.exports = {
    async test(req, res) {
        const { method, headers, body, params, query } = req
        const { locals } = res
        const { sid, cid } = headers
        let response = {}
        response['returnCode'] = '0000'
        response['returnMessage'] = `[${locals['SID']}]操作成功`
        response['data'] = { method, headers: { SID: sid, CID: cid }, body, params, query }
        res.send(response)
    },
}