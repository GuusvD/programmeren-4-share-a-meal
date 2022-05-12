const assert = require('assert')
const dbconnection = require('../../database/dbconnection')
const MailChecker = require('mailchecker')

let id

let controller = {
    validateUserInsert: (req, res, next) => {
        let user = req.body
        let { firstName, lastName, street, city, password, emailAdress } = user

        try {
            assert(typeof firstName === "string", "Firstname must be a string!")
            assert(typeof lastName === "string", "Lastname must be a string!")
            assert(typeof street === "string", "Street must be a string!")
            assert(typeof city === "string", "City must be a string!")
            assert(typeof password === "string", "Password must be a string!")
            assert(typeof emailAdress === "string", "Emailadress must be a string!")
            assert(MailChecker.isValid(emailAdress), "Emailadress is not valid!")

            next()
        } catch (error) {
            const errorFinal = {
                status: 400,
                message: error.message
            }
            next(errorFinal)
        }
    },
    validateUserUpdate: (req, res, next) => {
        let user = req.body
        let { emailAdress } = user

        try {
            assert(typeof emailAdress === "string", "Emailadress must be a string!")
            assert(MailChecker.isValid(emailAdress), "Emailadress is not valid!")

            next()
        } catch (error) {
            const errorFinal = {
                status: 400,
                message: error.message
            }
            next(errorFinal)
        }
    },
    addUser: (req, res) => {
        let user = req.body
        let boolean = false

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query('SELECT * FROM user', function (error, results, fields) {
                connection.release()

                if (error) throw error

                results.forEach(element => {
                    if (element.emailAdress === user.emailAdress) {
                        boolean = true
                    }
                })

                if (boolean == false) {
                    dbconnection.getConnection(function (err, connection) {
                        if (err) throw err

                        connection.query('SELECT * FROM user', function (error, results, fields) {
                            connection.release()

                            if (error) throw error

                            let highestId = -1

                            results.forEach(element => {
                                if (element.id > highestId) {
                                    highestId = element.id
                                }
                            })

                            id = highestId + 1

                            user = {
                                id,
                                ...user
                            }

                            dbconnection.getConnection(function (err, connection) {
                                if (err) throw err

                                connection.query(`INSERT INTO user (id, firstName, lastName, street, city, password, emailAdress) VALUES ('${user.id}', '${user.firstName}', '${user.lastName}', '${user.street}', '${user.city}', '${user.password}', '${user.emailAdress}')`, function (error, results, fields) {
                                    connection.release()

                                    if (error) throw error

                                    dbconnection.getConnection(function (err, connection) {
                                        if (err) throw err

                                        connection.query(`SELECT * FROM user WHERE id = ${id}`, function (error, results, fields) {
                                            connection.release()

                                            if (error) throw error

                                            let user = results[0]

                                            if (user.isActive == 0) {
                                                user.isActive = false
                                            } else {
                                                user.isActive = true
                                            }

                                            res.status(201).json({
                                                status: 201,
                                                result: user
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                } else {
                    res.status(409).json({
                        status: 409,
                        message: 'Emailadress already taken'
                    })
                }
            })
        })
    },
    getAllUsers: (req, res) => {
        //
        const { firstName, lastName } = req.query
        let query = 'SELECT * FROM user'
        let boolean = false

        if (firstName || lastName) {
            query += ' WHERE '

            if (firstName) {
                query += `firstName = '${firstName}'`
            }
    
            if (lastName && firstName) {
                query += ` AND lastName = '${lastName}'`
                boolean = true
            }

            if (lastName && boolean == false) {
                query += `lastName = '${lastName}'`
            }
        }

        query += ';'
        console.log(query)
        //

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(query, function (error, results, fields) {
                connection.release()

                if (error) throw error

                res.status(200).json({
                    status: 200,
                    result: results
                })
            })
        })
    },
    getUserById: (req, res) => {
        const id = req.params.id

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(`SELECT * FROM user WHERE id = ${id}`, function (error, results, fields) {
                connection.release()

                if (error) throw error

                if (results.length == 0) {
                    res.status(404).json({
                        status: 404,
                        message: `User does not exist`
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        result: results[0]
                    })
                }
            })
        })
    },
    getUserProfile: (req, res) => {
        res.status(501).json({
            status: 501,
            message: 'This function has not been implemented yet'
        })
    },
    updateUser: (req, res) => {
        const id = req.params.id
        let existingId = false
        let uniqueEmail = true
        let newUser = req.body
        let oldUser

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(`SELECT * FROM user WHERE id = ${id}`, function (error, results, fields) {
                connection.release()

                if (error) throw error

                if (results.length != 0) {
                    existingId = true
                    oldUser = results[0]
                }

                dbconnection.getConnection(function (err, connection) {
                    if (err) throw err

                    connection.query('SELECT * FROM user', function (error, results, fields) {
                        connection.release()

                        if (error) throw error

                        results.forEach(element => {
                            if (element.emailAdress == newUser.emailAdress && element.id != id) {
                                uniqueEmail = false
                            }
                        })

                        if (existingId == true && uniqueEmail == true && !(Object.keys(req.body).length === 0)) {
                            const user = {
                                ...oldUser,
                                ...newUser
                            }

                            dbconnection.getConnection(function (err, connection) {
                                if (err) throw err

                                connection.query(`UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', emailAdress = '${user.emailAdress}', password = '${user.password}', street = '${user.street}', city = '${user.city}' WHERE id = ${id}`, function (error, results, fields) {
                                    connection.release()

                                    if (error) throw error

                                    res.status(200).json({
                                        status: 200,
                                        result: user
                                    })
                                })
                            })
                        } else {
                            if (Object.keys(req.body).length === 0) {
                                res.status(400).json({
                                    status: 400,
                                    message: "No saveable user data"
                                })
                            } else if (existingId == false) {
                                res.status(400).json({
                                    status: 400,
                                    message: `User does not exist`
                                })
                            } else if (uniqueEmail == false) {
                                res.status(409).json({
                                    status: 409,
                                    message: "Emailadress already taken"
                                })
                            }
                        }
                    })
                })
            })
        })
    },
    deleteUser: (req, res) => {
        const id = req.params.id
        let existingId = false

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query('SELECT * FROM user', function (error, results, fields) {
                connection.release()

                if (error) throw error

                results.forEach(element => {
                    if (element.id == id) {
                        existingId = true
                    }
                })

                if (existingId == true) {
                    dbconnection.getConnection(function (err, connection) {
                        if (err) throw err

                        connection.query(`DELETE FROM user WHERE id = ${id}`, function (error, results, fields) {
                            connection.release()

                            if (error) throw error

                            res.status(200).json({
                                status: 200,
                                message: "User succesfully deleted"
                            })
                        })
                    })
                } else {
                    res.status(400).json({
                        status: 400,
                        message: `User does not exist`
                    })
                }
            })
        })
    }
}

module.exports = controller