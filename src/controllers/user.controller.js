const assert = require('assert')
const dbconnection = require('../../database/dbconnection')

let id

let controller = {
    validateUserInsert: (req, res, next) => {
        let user = req.body
        let { firstName, lastName, street, city, password, emailAdress, phoneNumber } = user

        try {
            assert(typeof firstName === "string", "Firstname must be a string!")
            assert(typeof lastName === "string", "Lastname must be a string!")
            assert(typeof street === "string", "Street must be a string!")
            assert(typeof city === "string", "City must be a string!")
            assert(typeof password === "string", "Password must be a string!")
            assert(typeof emailAdress === "string", "Emailadress must be a string!")
            assert(typeof phoneNumber === "string", "Phonenumber must be a string!")
            //Checks if email contains @ character and dots at the right places
            assert(emailAdress.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/), "Emailadress is not valid!")
            //At least one digit, at least one lower case, at least one upper case and at least 8 characters
            assert(password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/), "Password is not strong enough!")
            //Checks if phonenumber starts with 06 and has 8 more numbers after that
            assert(phoneNumber.match(/^06[0-9]{8}$/), "Phonenumber is not valid!")

            next()
        } catch (error) {
            return next({
                status: 400,
                message: error.message
            })
        }
    },
    validateUserUpdate: (req, res, next) => {
        let user = req.body
        let { emailAdress, password, phoneNumber } = user

        try {
            assert(typeof emailAdress === "string", "Emailadress must be a string!")
            //Checks if email contains @ character and dots at the right places
            assert(emailAdress.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/), "Emailadress is not valid!")

            if (password) {
                assert(typeof password === "string", "Password must be a string!")
                //At least one digit, at least one lower case, at least one upper case and at least 8 characters
                assert(password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/), "Password is not strong enough!")
            }

            if (phoneNumber) {
                assert(typeof phoneNumber === "string", "Phonenumber must be a string!")
                //Checks if phonenumber starts with 06 and has 8 more numbers after that
                assert(phoneNumber.match(/^06[0-9]{8}$/), "Phonenumber is not valid!")
            }

            next()
        } catch (error) {
            return next({
                status: 400,
                message: error.message
            })
        }
    },
    addUser: (req, res, next) => {
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

                                connection.query(`INSERT INTO user (id, firstName, lastName, street, city, password, emailAdress, phoneNumber) VALUES ('${user.id}', '${user.firstName}', '${user.lastName}', '${user.street}', '${user.city}', '${user.password}', '${user.emailAdress}', '${user.phoneNumber}')`, function (error, results, fields) {
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
                    return next({
                        status: 409,
                        message: 'Emailadress already taken'
                    })
                }
            })
        })
    },
    getAllUsers: (req, res, next) => {
        let { isActive, firstName, lastName, emailAdress, street, city, phoneNumber, limit } = req.query

        let query = "SELECT * FROM user"

        if (isActive || firstName || lastName || emailAdress || street || city || phoneNumber || limit) {
            let count = 0

            if (isActive || firstName || lastName || emailAdress || street || city || phoneNumber) {
                query += " WHERE "
            }

            if (isActive) {
                if (isActive == true) {
                    isActive = 1
                } else if (isActive == false) {
                    isActive = 0
                }

                query += `isActive = ${isActive}`
                count++
            }

            if (firstName) {
                if (count === 1) {
                    query += " AND "
                }
                count++
                query += `firstName = '${firstName}'`
            }

            if (lastName) {
                if (count === 1) {
                    query += " AND "
                }
                count++
                query += `lastName = '${lastName}'`
            }

            if (emailAdress) {
                if (count === 1) {
                    query += " AND "
                }
                count++
                query += `emailAdress = '${emailAdress}'`
            }

            if (street) {
                if (count === 1) {
                    query += " AND "
                }
                count++
                query += `street = '${street}'`
            }

            if (city) {
                if (count === 1) {
                    query += " AND "
                }
                count++
                query += `city = '${city}'`
            }

            if (phoneNumber) {
                if (count === 1) {
                    query += " AND "
                }
                count++
                query += `phoneNumber = '${phoneNumber}'`
            }

            if (limit) {
                count++
                query += ` LIMIT ${limit}`
            }

            if (count > 2) {
                return next({
                    status: 400,
                    message: "Only 2 filter parameters allowed!"
                })
            }
        }

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(query, function (error, results, fields) {
                connection.release()

                if (error) throw error

                results.forEach(element => {
                    if (element.isActive == 1) {
                        element.isActive = true
                    } else {
                        element.isActive = false
                    }
                })

                res.status(200).json({
                    status: 200,
                    result: results
                })
            })
        })
    },
    getUserById: (req, res, next) => {
        const id = req.params.id

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(`SELECT * FROM user WHERE id = ${id}`, function (error, results, fields) {
                connection.release()

                if (error) throw error

                if (results.length == 0) {
                    return next({
                        status: 404,
                        message: "User does not exist"
                    })
                } else {
                    if (results[0].isActive == 1) {
                        results[0].isActive = true
                    } else {
                        results[0].isActive = false
                    }

                    res.status(200).json({
                        status: 200,
                        result: results[0]
                    })
                }
            })
        })
    },
    getUserProfile: (req, res) => {
        const id = req.userId

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(`SELECT * FROM user WHERE id = ${id}`, function (error, results, fields) {
                connection.release()

                if (err) throw err

                let user = results[0]

                if (user.isActive == 1) {
                    user.isActive = true
                } else {
                    user.isActive = false
                }

                res.status(200).json({
                    status: 200,
                    result: user
                })
            })
        })
    },
    updateUser: (req, res, next) => {
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

                                connection.query(`UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', emailAdress = '${user.emailAdress}', password = '${user.password}', street = '${user.street}', city = '${user.city}', phoneNumber = '${user.phoneNumber}', isActive = ${user.isActive} WHERE id = ${id}`, function (error, results, fields) {
                                    connection.release()

                                    if (error) throw error

                                    if (user.isActive == 0) {
                                        user.isActive = false
                                    } else {
                                        user.isActive = true
                                    }

                                    res.status(200).json({
                                        status: 200,
                                        result: user
                                    })
                                })
                            })
                        } else {
                            if (Object.keys(req.body).length === 0) {
                                return next({
                                    status: 400,
                                    message: "No saveable user data"
                                })
                            } else if (existingId == false) {
                                return next({
                                    status: 400,
                                    message: "User does not exist"
                                })
                            } else if (uniqueEmail == false) {
                                return next({
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
    deleteUser: (req, res, next) => {
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
                    if (req.userId == id) {
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
                        return next({
                            status: 403,
                            message: "Can not delete other users"
                        })
                    }
                } else {
                    return next({
                        status: 400,
                        message: "User does not exist"
                    })
                }
            })
        })
    }
}

module.exports = controller