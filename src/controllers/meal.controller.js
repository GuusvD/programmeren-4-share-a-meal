const assert = require('assert')
const dbconnection = require('../../database/dbconnection')

let id

let controller = {
    validateMealInsert: (req, res, next) => {
        let meal = req.body
        let { isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, allergenes } = meal

        try {
            assert(typeof isVega === 'boolean', 'IsVega must be a boolean!')
            assert(typeof isVegan === 'boolean', 'IsVegan must be a boolean!')
            assert(typeof isToTakeHome === 'boolean', 'IsToTakeHome must be a boolean!')
            assert(typeof dateTime === 'string', 'DateTime must be a string!')
            assert(typeof maxAmountOfParticipants === 'integer', 'MaxAmountOfParticipants must be a integer!')
            assert(typeof price === 'double', 'Price must be a double!')
            assert(typeof imageUrl === 'string', 'ImageUrl must be a string!')
            assert(typeof name === 'string', 'Name must be a string!')
            assert(typeof description === 'string', 'Description must be a string!')
            assert(typeof allergenes === 'string', 'Allergenes must be a string!')

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

                    connection.query(`SELECT * FROM user WHERE id = ${req.userId}`, function (error, results, fields) {
                        connection.release()

                        if (error) throw error

                        let user = results[0]

                        dbconnection.getConnection(function (err, connection) {
                            if (err) throw err

                            connection.query(`INSERT INTO meal (id, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES ('${meal.id}', '${meal.isVega}', '${meal.isVegan}', '${meal.isToTakeHome}', '${meal.dateTime}', '${meal.maxAmountOfParticipants}', '${meal.price}', '${meal.imageUrl}, '${req.userId}', '${meal.name}', '${meal.description}', '${meal.allergenes}')`, function (error, results, fields) {
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
            })
        })
    },
    getAllMeals: (req, res) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query('SELECT * FROM meal', function (error, results, fields) {
                connection.release()

                if (error) throw error

                res.status(200).json({
                    status: 200,
                    results: results
                })
            })
        })
    },
    getMealById: (req, res) => {
        const id = req.params.id

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(`SELECT * FROM meal WHERE id = ${id}`, function (error, results, fields) {
                connection.release()

                if (error) throw error

                if (results.length == 0) {
                    res.status(404).json({
                        status: 404,
                        message: `Meal does not exist`
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        result: results[0]
                    })
                }
            })
        })
    }
}

module.exports = controller