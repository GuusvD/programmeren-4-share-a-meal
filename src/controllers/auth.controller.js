const assert = require("assert")
const jwt = require("jsonwebtoken")
const dbconnection = require("./../../database/dbconnection")
// const validateEmail = require('../util/emailvalidator')
const jwtSecretKey = require("./../config/config").jwtSecretKey

module.exports = {
    login(req, res, next) {
        dbconnection.getConnection((err, connection) => {
            if (err) {
                res.status(500).json({
                    status: 500,
                    message: err.toString()
                })
            }
            if (connection) {
                connection.query("SELECT id, emailAdress, password, firstName, lastName FROM user WHERE emailAdress = ?", [req.body.emailAdress], (err, rows, fields) => {
                    connection.release()
                    if (err) {
                        res.status(500).json({
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

                            jwt.sign(payload, jwtSecretKey, { expiresIn: "1h" }, function (err, token) {
                                res.status(200).json({
                                    status: 200,
                                    result: { ...userinfo, token },
                                })
                            })
                        } else {
                            res.status(404).json({
                                status: 404,
                                message: "User not found or password invalid!",
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
            res.status(400).json({
                status: 400,
                message: err.toString(),
            })
        }
    },
    validateToken(req, res, next) {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            res.status(401).json({
                status: 401,
                message: "Authorization header missing!",
            })
        } else {
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    res.status(401).json({
                        status: 401,
                        message: "Invalid token!",
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