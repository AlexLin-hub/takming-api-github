// API方法
const { sandbox_user } = require('../../models/user')
const { Op } = require("sequelize");
const time = require('../../tools/time');
const tools = require('../../tools/tools');
const { response } = require('express');

const checkBody = (body) => {
    const Response = {}
    const { SID, zip, email, phone, gender } = body || {}
    if (zip && (typeof zip !== 'number' || zip > 999 || zip < 100)) {
        Response['returnCode'] = '1002'
        Response['returnMessage'] = `[${SID}]操作失敗，郵遞區號資料格式錯誤`
        return { success: false, Response }
    }
    if (email && !(/.+@.+\..+/.test(email))) {
        Response['returnCode'] = '1002'
        Response['returnMessage'] = `[${SID}]操作失敗，電子信箱資料格式錯誤`
        return { success: false, Response }
    }
    if (phone && phone.length !== 10) {
        Response['returnCode'] = '1002'
        Response['returnMessage'] = `[${SID}]操作失敗，電話號碼資料格式錯誤`
        return { success: false, Response }
    }

    if (gender && gender !== "O" && gender !== "W" && gender !== "M") {
        Response['returnCode'] = '1002'
        Response['returnMessage'] = `[${SID}]操作失敗，性別資料格式錯誤`
        return { success: false, Response }
    }
    return { success: true }
}

module.exports = {
    // 使用者資訊
    async user(req, res, next) {
        const { method, body, params, query, headers, route } = req
        const { locals } = res
        console.log(`${time.now()}:[${method}]使用者`)
        let Response = {}
        let logDB = {}
        try {
            const { SID, CID } = locals

            if (SID && CID) {
                switch (method.toUpperCase()) {
                    case "GET": {
                        let UID = ''
                        if (params['UID']) {
                            UID = params['UID']
                        } else {
                            UID = query['UID']
                        }

                        if (!UID) {
                            // 相似搜尋
                            if (Object.keys(query).length) {
                                let user = []
                                const { zip, gender, address } = query || {}
                                const needDB = { zip, gender }
                                let findDB = {}
                                const checkData = checkBody({ gender, address, zip: Number(zip), SID })
                                if (checkData['success']) {
                                    for (const v in needDB) {
                                        if (needDB[v]) {
                                            findDB[v] = needDB[v]
                                        }
                                    }
                                    if (address) {
                                        user = await sandbox_user.findAll({
                                            where: {
                                                [Op.and]: [
                                                    {
                                                        [Op.or]: [
                                                            { SID: 'ROOT' },
                                                            { SID, CID }
                                                        ]
                                                    },
                                                    {
                                                        [Op.or]: [
                                                            { address: { [Op.like]: `%${address}` } },
                                                            { address: { [Op.like]: `${address}%` } },
                                                            { address: { [Op.like]: `%${address}%` } }
                                                        ]
                                                    },
                                                    { ...findDB },
                                                    { isDelete: null }
                                                ],

                                            },
                                            order: [['UID', 'DESC']]
                                        })
                                    } else {
                                        user = await sandbox_user.findAll({
                                            where: {
                                                [Op.or]: [
                                                    { SID: 'ROOT' },
                                                    { SID, CID }
                                                ], ...findDB, isDelete: null
                                            },
                                            order: [['UID', 'DESC']]
                                        })
                                    }
                                    Response['returnCode'] = '0000'
                                    Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                    Response['data'] = { user }
                                } else {
                                    Response = checkData['Response']
                                }
                            }
                            // 預設搜尋 
                            else {
                                const user = await sandbox_user.findAll({
                                    where: {
                                        [Op.or]: [
                                            { SID: 'ROOT' },
                                            { SID, CID }
                                        ], isDelete: null
                                    },
                                    order: [['UID', 'DESC']]
                                })
                                Response['returnCode'] = '0000'
                                Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                Response['data'] = { user }
                            }
                        } else {
                            UID = UID.split(',')
                            const user = await sandbox_user.findAll({
                                where: {
                                    UID: { [Op.or]: UID }, SID: {
                                        [Op.or]: [SID, 'ROOT']
                                    }, isDelete: null
                                },
                                order: [['UID', 'DESC']]
                            })
                            Response['returnCode'] = '0000'
                            Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                            Response['data'] = { user }
                        }
                        break;
                    }
                    case "POST": {
                        switch (route.path.toLowerCase()) {
                            case '/get-user': {
                                const user = await sandbox_user.findAll({
                                    where: {
                                        [Op.or]: [
                                            { SID: 'ROOT' },
                                            { SID, CID }
                                        ], isDelete: null
                                    },
                                    order: [['UID', 'DESC']]
                                })
                                Response['returnCode'] = '0000'
                                Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                Response['data'] = { user }
                                break;
                            }

                            case '/update-user': {
                                const { UID, name, phone, gender, email, zip, address } = body

                                if (!!UID && !!name && !!phone && !!gender && !!email && !!zip && !!address) {
                                    const checkData = checkBody({ ...body, SID })
                                    if (checkData['success']) {
                                        const checkDB = await sandbox_user.findOne({ where: { SID, CID, [Op.not]: { UID }, [Op.or]: { phone, email }, isDelete: null } })

                                        if (!checkDB) {
                                            const updateTime = time.now()
                                            const updateDB = { name, phone, gender, email, zip, address, updateTime }

                                            const updateRes = await sandbox_user.update(updateDB, { where: { SID, CID, UID } })
                                            if (updateRes[0]) {
                                                Response['returnCode'] = '0000'
                                                Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                                Response['data'] = { UID, name, phone, gender, email, zip, address, updateTime }
                                            } else {
                                                Response['returnCode'] = '2001'
                                                Response['returnMessage'] = `[${SID}]操作失敗，查無資料`
                                            }
                                        } else {
                                            Response['returnCode'] = '2002'
                                            Response['returnMessage'] = `[${SID}]操作失敗，資料重複`
                                        }
                                    } else {
                                        Response = checkData['Response']
                                    }
                                } else {
                                    Response['returnCode'] = '1001'
                                    Response['returnMessage'] = `[${SID}]操作失敗，資料遺漏(UID, name, phone, gender, email, zip, address)`
                                }
                                break;
                            }

                            case '/delete-user': {
                                const { UID } = body

                                if (!!UID) {
                                    const checkDB = await sandbox_user.findOne({ where: { UID, CID } })
                                    if (checkDB) {
                                        const { isDelete } = checkDB || {}
                                        if (isDelete) {
                                            Response['returnCode'] = '0000'
                                            Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                            Response['data'] = { UID, isDelete }
                                        } else {
                                            const updateTime = time.now()
                                            await sandbox_user.update({ updateTime, isDelete: updateTime }, { where: { UID, CID } })
                                            Response['returnCode'] = '0000'
                                            Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                            Response['data'] = { UID, isDelete: updateTime }
                                        }
                                    } else {
                                        Response['returnCode'] = '2002'
                                        Response['returnMessage'] = `[${SID}]操作失敗，查無資料`
                                    }
                                } else {
                                    Response['returnCode'] = '1001'
                                    Response['returnMessage'] = `[${SID}]操作失敗，資料遺漏(UID)`
                                }
                                break;
                            }

                            default: {
                                const { name, phone, gender, email, zip, address } = body
                                if (!!name && !!phone && !!gender && !!email && !!zip && !!address) {
                                    const checkData = checkBody({ ...body, SID })
                                    if (checkData['success']) {
                                        const checkDB = await sandbox_user.findOne({ where: { SID, CID, [Op.or]: { phone, email }, isDelete: null } })

                                        if (!checkDB) {
                                            const createTime = updateTime = time.now()
                                            const UID = `${time.now('id')}${tools.random(1, 99)}`
                                            const createDB = { SID, CID, UID, name, phone, gender, email, zip, address, createTime, updateTime }

                                            await sandbox_user.create(createDB)

                                            Response['returnCode'] = '0000'
                                            Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                            Response['data'] = { CID, UID, name, phone, gender, email, zip, address, createTime }
                                        } else {
                                            Response['returnCode'] = '2002'
                                            Response['returnMessage'] = `[${SID}]操作失敗，資料重複`
                                        }
                                    } else {
                                        Response = checkData['Response']
                                    }
                                } else {
                                    Response['returnCode'] = '1001'
                                    Response['returnMessage'] = `[${SID}]操作失敗，資料遺漏(name, phone, gender, email, zip, address)`
                                }
                                break;
                            }
                        }
                        break;
                    }
                    case "PUT": {
                        const { name, phone, gender, email, zip, address } = body
                        let UID = ''
                        if (params['UID']) {
                            UID = params['UID']
                        } else if (query['UID']) {
                            UID = query['UID']
                        } else {
                            UID = body['UID']
                        }
                        if (!!UID && !!name && !!phone && !!gender && !!email && !!zip && !!address) {
                            const checkData = checkBody({ ...body, SID })
                            if (checkData['success']) {
                                const checkDB = await sandbox_user.findOne({ where: { SID, CID, [Op.not]: { UID }, [Op.or]: { phone, email }, isDelete: null } })

                                if (!checkDB) {
                                    const updateTime = time.now()
                                    const updateDB = { name, phone, gender, email, zip, address, updateTime }

                                    const updateRes = await sandbox_user.update(updateDB, { where: { SID, CID, UID } })
                                    if (updateRes[0]) {
                                        Response['returnCode'] = '0000'
                                        Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                        Response['data'] = { UID, name, phone, gender, email, zip, address, updateTime }
                                    } else {
                                        Response['returnCode'] = '2001'
                                        Response['returnMessage'] = `[${SID}]操作失敗，查無資料`
                                    }
                                } else {
                                    Response['returnCode'] = '2002'
                                    Response['returnMessage'] = `[${SID}]操作失敗，資料重複`
                                }
                            } else {
                                Response = checkData['Response']
                            }
                        } else {
                            Response['returnCode'] = '1001'
                            Response['returnMessage'] = `[${SID}]操作失敗，資料遺漏(UID, name, phone, gender, email, zip, address)`
                        }

                        break;
                    }
                    case "DELETE": {
                        let UID = ''
                        if (params['UID']) {
                            UID = params['UID']
                        } else {
                            UID = query['UID']
                        }

                        if (!!UID) {
                            const checkDB = await sandbox_user.findOne({ where: { UID, CID } })
                            if (checkDB) {
                                const { isDelete } = checkDB || {}
                                if (isDelete) {
                                    Response['returnCode'] = '0000'
                                    Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                    Response['data'] = { UID, isDelete }
                                } else {
                                    const updateTime = time.now()
                                    await sandbox_user.update({ updateTime, isDelete: updateTime }, { where: { UID, CID } })
                                    Response['returnCode'] = '0000'
                                    Response['returnMessage'] = `${time.now()}:[${SID}]操作成功`
                                    Response['data'] = { UID, isDelete: updateTime }
                                }
                            } else {
                                Response['returnCode'] = '2002'
                                Response['returnMessage'] = `[${SID}]操作失敗，查無資料`
                            }
                        } else {
                            Response['returnCode'] = '1001'
                            Response['returnMessage'] = `[${SID}]操作失敗，資料遺漏(UID)`
                        }
                        break;
                    }
                }
                res.send(Response)
                logDB = { SID, CID, req: JSON.stringify({ method, body, params, query, headers, route }), res: JSON.stringify(Response), time: time.now() }
                locals.logDB = logDB
                next()
            } else {
                Response['returnCode'] = '9001'
                Response['returnMessage'] = '此用戶無法正常操作，或輸入SID/CID錯誤'
                res.send(Response)
                logDB = { SID, CID, req: JSON.stringify({ method, body, params, query, headers, route }), res: JSON.stringify(Response), time: time.now() }
                locals.logDB = logDB
                next()
            }
        } catch (error) {
            Response['returnCode'] = '9000'
            Response['returnMessage'] = `Error: ${error}`

            console.log(`${time.now()}:[${Response['returnCode']}]-${Response['returnMessage']}`)
            res.send(Response)
            logDB = { SID, CID, req: JSON.stringify({ method, body, params, query, headers, route }), res: JSON.stringify(Response), time: time.now() }
            locals.logDB = logDB
            next()
        }
    },
}
