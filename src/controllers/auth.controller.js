const assert = require("assert")
const jwt = require("jsonwebtoken")
const dbconnection = require("./../../database/dbconnection")
// const validateEmail = require('../util/emailvalidator')
const jwtSecretKey = require("./../config/config").jwtSecretKey

module.exports = {
    login(req, res, next) {
        dbconnection.getConnection((err, connection) => {
            if (err) {
                return next({
                    status: 500,
                    message: err.toString()
                })
            }
            if (connection) {
                connection.query("SELECT id, emailAdress, password, firstName, lastName FROM user WHERE emailAdress = ?", [req.body.emailAdress], (err, rows, fields) => {
                    connection.release()
                    if (err) {
                        return next({
                            status: 500,
                            message: err.toString()
                        })
                    }
                    if (rows) {
                        if (rows && rows.length === 1 && rows[0].password == req.body.password) {
                            const { password, ...userinfo } = rows[0]
                            const payload = {
                                userId: userinfo.id,
                            }

                            jwt.sign(payload, jwtSecretKey, { expiresIn: "24h" }, function (err, token) {
                                res.status(200).json({
                                    status: 200,
                                    result: { ...userinfo, token },
                                })
                            })
                        } else {
                            return next({
                                status: 404,
                                message: "User not found or password invalid!"
                            })
                        }
                    }
                })
            }
        })
    },
    validateLogin(req, res, next) {
        try {
            assert(typeof req.body.emailAdress === "string", "Emailadress must be a string!")
            assert(typeof req.body.password === "string", "Password must be a string!")

            next()
        } catch (err) {
            return next({
                status: 400,
                message: err.message
            })
        }
    },
    validateToken(req, res, next) {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return next({
                status: 401,
                message: "Unauthorized"
            })
        } else {
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    return next({
                        status: 401,
                        message: "Invalid token!"
                    })
                }
                if (payload) {
                    req.userId = payload.userId
                    next()
                }
            })
        }
    }
}