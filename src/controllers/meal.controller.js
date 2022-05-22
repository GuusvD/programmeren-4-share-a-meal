const assert = require('assert')
const dbconnection = require('../../database/dbconnection')

let id

let controller = {
    validateMealInsert: (req, res, next) => {
        let meal = req.body
        let { isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, allergenes, isActive } = meal

        try {
            assert(typeof isVega === 'boolean', 'IsVega must be a boolean!')
            assert(typeof isVegan === 'boolean', 'IsVegan must be a boolean!')
            assert(typeof isToTakeHome === 'boolean', 'IsToTakeHome must be a boolean!')
            assert(typeof dateTime === 'string', 'DateTime must be a string!')
            assert(typeof maxAmountOfParticipants === 'number', 'MaxAmountOfParticipants must be a number!')
            assert(typeof price === 'number', 'Price must be a number!')
            assert(typeof imageUrl === 'string', 'ImageUrl must be a string!')
            assert(typeof name === 'string', 'Name must be a string!')
            assert(typeof description === 'string', 'Description must be a string!')
            assert(typeof allergenes === 'object', 'Allergenes must be a object!')
            assert(typeof isActive === 'boolean', 'IsActive must be a boolean!')

            next()
        } catch (error) {
            const errorFinal = {
                status: 400,
                message: error.message
            }
            next(errorFinal)
        }
    },
    addMeal: (req, res) => {
        let meal = req.body

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query('SELECT * FROM meal', function (error, results, fields) {
                connection.release()

                if (error) throw error

                let highestId = -1

                results.forEach(element => {
                    if (element.id > highestId) {
                        highestId = element.id
                    }
                })

                id = highestId + 1

                meal = {
                    id,
                    ...meal
                }

                dbconnection.getConnection(function (err, connection) {
                    if (err) throw err

                    connection.query(`INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES (${id}, ${meal.isActive}, ${meal.isVega}, ${meal.isVegan}, ${meal.isToTakeHome}, '${meal.dateTime}', ${meal.maxAmountOfParticipants}, ${meal.price}, '${meal.imageUrl}', ${req.userId}, '${meal.name}', '${meal.description}', '${meal.allergenes}')`, function (error, results, fields) {
                        connection.release()

                        if (error) throw error

                        dbconnection.getConnection(function (err, connection) {
                            if (err) throw err

                            connection.query(`SELECT * FROM meal WHERE id = ${id}`, function (error, results, fields) {
                                connection.release()

                                if (error) throw error

                                let meal = results[0]

                                if (meal.isActive == 0) {
                                    meal.isActive = false
                                } else {
                                    meal.isActive = true
                                }

                                if (meal.isVega == 0) {
                                    meal.isVega = false
                                } else {
                                    meal.isVega = true
                                }

                                if (meal.isVegan == 0) {
                                    meal.isVegan = false
                                } else {
                                    meal.isVegan = true
                                }

                                if (meal.isToTakeHome == 0) {
                                    meal.isToTakeHome = false
                                } else {
                                    meal.isToTakeHome = true
                                }

                                dbconnection.getConnection(function (err, connection) {
                                    if (err) throw err

                                    connection.query(`SELECT * FROM user WHERE id = ${req.userId}`, function (error, results, fields) {
                                        connection.release()

                                        let user = results[0]

                                        if (user.isActive == 0) {
                                            user.isActive = false
                                        } else {
                                            user.isActive = true
                                        }

                                        delete meal.cookId

                                        meal = {
                                            ...meal,
                                            cook: user
                                        }

                                        res.status(201).json({
                                            status: 201,
                                            result: meal
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    },
    getAllMeals: (req, res) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err

            connection.query("SELECT * FROM meal", (err, results, fields) => {
                if (err) throw err

                const amountOfMeals = results.length
                let allMeals = []

                results.forEach((currentMeal) => {
                    const cookId = currentMeal.cookId
                    delete currentMeal.cookId

                    if (currentMeal.isActive == 0) {
                        currentMeal.isActive = false
                    } else {
                        currentMeal.isActive = true
                    }

                    if (currentMeal.isVega == 0) {
                        currentMeal.isVega = false
                    } else {
                        currentMeal.isVega = true
                    }

                    if (currentMeal.isVegan == 0) {
                        currentMeal.isVegan = false
                    } else {
                        currentMeal.isVegan = true
                    }

                    if (currentMeal.isToTakeHome == 0) {
                        currentMeal.isToTakeHome = false
                    } else {
                        currentMeal.isToTakeHome = true
                    }

                    let meal = currentMeal

                    dbconnection.query(`SELECT * FROM user WHERE id = ${cookId}`, (err, cook, fields) => {
                        if (err) throw err

                        cook = cook[0]

                        if (cook.isActive == 0) {
                            cook.isActive = false
                        } else {
                            cook.isActive = true
                        }

                        meal = {
                            ...meal,
                            cook: cook,
                        }

                        dbconnection.query("SELECT DISTINCT userId FROM meal_participants_user WHERE mealId = ?", currentMeal.id, (err, results, fields) => {
                            if (err) throw err

                            let participantsAmount = results.length

                            let participants = []

                            const callback = () => {
                                if (participantsAmount === participants.length) {
                                    meal = {
                                        ...meal,
                                        participants: participants
                                    }

                                    allMeals.push(meal)
                                    connection.release()
                                    if (amountOfMeals === allMeals.length) {
                                        res.status(200).json({
                                            status: 200,
                                            result: allMeals.sort((a, b) => {
                                                return a.id - b.id
                                            })
                                        })
                                        res.end()
                                    }
                                }
                            }

                            if (participantsAmount > 0) {
                                results.forEach((participant) => {
                                    dbconnection.query("SELECT * FROM user WHERE id = ?", participant.userId, (err, results, fields) => {
                                        participants.push(results)
                                        callback()
                                    })
                                })
                            } else {
                                callback()
                            }
                        })
                    })
                })
            })
        })
    },
    getMealById: (req, res) => {
        const id = req.params.id
        let participants = []

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(`SELECT * FROM meal WHERE id = ${id}`, function (error, meal, fields) {
                connection.release

                if (err) throw err

                meal = meal[0]

                if (meal) {
                    if (meal.isActive == 1) {
                        meal.isActive = true
                    } else {
                        meal.isActive = false
                    }

                    if (meal.isVega == 0) {
                        meal.isVega = false
                    } else {
                        meal.isVega = true
                    }

                    if (meal.isVegan == 0) {
                        meal.isVegan = false
                    } else {
                        meal.isVegan = true
                    }

                    if (meal.isToTakeHome == 0) {
                        meal.isToTakeHome = false
                    } else {
                        meal.isToTakeHome = true
                    }

                    dbconnection.getConnection(function (err, connection) {
                        if (err) throw err

                        connection.query(`SELECT * FROM meal_participants_user WHERE mealId = ${id}`, function (error, participantsResult, fields) {
                            connection.release

                            if (err) throw err

                            dbconnection.getConnection(function (err, connection) {
                                if (err) throw err

                                connection.query(`SELECT * FROM user`, function (error, users, fields) {
                                    connection.release

                                    dbconnection.getConnection(function (err, connection) {
                                        if (err) throw err

                                        connection.query(`SELECT * FROM user WHERE id = ${meal.cookId}`, function (error, cook, fields) {
                                            connection.release

                                            if (err) throw err

                                            delete meal.cookId

                                            if (cook[0].isActive == 1) {
                                                cook[0].isActive = true
                                            } else {
                                                cook[0].isActive = false
                                            }

                                            meal = {
                                                ...meal,
                                                cook: cook[0]
                                            }

                                            participantsResult.forEach(participant => {
                                                users.forEach(user => {
                                                    if (user.id == participant.userId) {
                                                        if (user.isActive == 1) {
                                                            user.isActive = true
                                                        } else {
                                                            user.isActive = false
                                                        }

                                                        participants.push(user)
                                                    }
                                                })
                                            })

                                            meal = {
                                                ...meal,
                                                participants
                                            }

                                            res.status(200).json({
                                                status: 200,
                                                result: meal
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                } else {
                    res.status(404).json({
                        status: 404,
                        message: "Meal does not exist"
                    })
                }
            })
        })
    },
    deleteMeal: (req, res) => {
        const id = req.params.id
        let existingId = false

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query('SELECT * FROM meal', function (error, results, fields) {
                connection.release()

                if (error) throw error

                results.forEach(element => {
                    if (element.id == id) {
                        existingId = true
                    }
                })

                dbconnection.getConnection(function (err, connection) {
                    if (err) throw err

                    connection.query(`SELECT cookId FROM meal WHERE id = ${id}`, function (error, results, fields) {
                        connection.release()

                        if (error) throw error

                        if (existingId == true) {
                            if (results[0].cookId == req.userId) {
                                dbconnection.getConnection(function (err, connection) {
                                    if (err) throw err

                                    connection.query(`DELETE FROM meal WHERE id = ${id}`, function (error, results, fields) {
                                        connection.release()

                                        if (error) throw error

                                        res.status(200).json({
                                            status: 200,
                                            message: "Meal succesfully deleted"
                                        })
                                    })
                                })
                            } else {
                                res.status(403).json({
                                    status: 403,
                                    message: "Can not delete meals created by other users"
                                })
                            }
                        } else {
                            res.status(404).json({
                                status: 404,
                                message: `Meal does not exist`
                            })
                        }
                    })
                })
            })
        })
    }
}

module.exports = controller