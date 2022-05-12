const assert = require('assert')
const dbconnection = require('../../database/dbconnection')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../config/config').jwtSecretKey

let controller = {
    login: (req, res, next) => {
        const { emailAdress, password } = req.body

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(`SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = '${emailAdress}';`, function (error, results, fields) {
                connection.release()

                if (error) throw error

                if (results) {
                    if (results && results.length === 1 && results[0].password === password) {
                        const { password, ...userinfo } = results[0]
                        const payload = {
                            userId: userinfo.id
                        }

                        jwt.sign(payload, jwtSecretKey, { expiresIn: '1h' }, function (err, token) {
                            if (err) throw err
                            if (token) {
                                res.status(200).json({
                                    status: 200,
                                    results: { ...userinfo, token }
                                })
                            }
                        })
                    }
                } else {
                    res.status(401).json({
                        status: 401,
                        message: 'User not found or password invalid'
                    })
                }
            })
        })
    }
}

module.exports = controller