const assert = require('assert')

let database = []
let id = 0

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body
        let { firstName, lastName, emailAdress } = user

        try {
            assert(typeof firstName === "string", "Firstname must be a string!")
            assert(typeof lastName === "string", "Lastname must be a string!")
            assert(typeof emailAdress === "string", "Emailadress must be a string!")

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

        if (!(Object.keys(req.body).length === 0)) {
            if (database.length == 0) {
                id = 1
            } else {
                id = database[database.length - 1].id + 1
            }

            user = {
                id,
                ...user,
            }

            database.forEach(element => {
                if (element.emailAdress == user.emailAdress) {
                    res.status(409).json({
                        status: 409,
                        message: "Emailadress already taken"
                    })

                    boolean = true

                    console.log("Emailadress already taken")
                }
            })

            if (boolean == false) {
                database.push(user)

                res.status(201).json({
                    status: 201,
                    result: user
                })

                console.log("Added a new user:")
                console.log(user)
            }
        } else {
            res.status(400).json({
                status: 400,
                message: "No saveable user data"
            })

            console.log("No saveable user data")
        }

        res.end()
    },
    getAllUsers: (req, res) => {
        if (database.length > 0) {
            res.status(200).json({
                status: 200,
                result: database
            })

            console.log("Got all the users")
        } else {
            res.status(200).json({
                status: 200,
                message: "Database is empty"
            })
        }
        res.end()
    },
    getUserById: (req, res) => {
        const id = req.params.id
        let user = database.filter((item) => item.id == id)

        if (user.length > 0) {
            res.status(200).json({
                status: 200,
                result: user
            })

            console.log("Got the user by id")
        } else {
            res.status(404).json({
                status: 404,
                message: `User with id ${id} not found`
            })

            console.log(`User with id ${id} not found`)
        }
    },
    getUserProfile: (req, res) => {
        res.send("This function has not yet been implemented")

        console.log("Not implemented")
        res.end()
    },
    updateUser: (req, res) => {
        const id = req.params.id
        let existingId = false
        let uniqueEmail = true
        let user = req.body

        database.forEach(element => {
            if (element.id == id) {
                existingId = true
            }
        })

        database.forEach(element => {
            if (element.emailAdress == user.emailAdress && element.id != id) {
                uniqueEmail = false
            }
        })

        if (existingId == true && uniqueEmail == true && !(Object.keys(req.body).length === 0)) {
            database.forEach(element => {
                if (element.id == id) {
                    let index = database.indexOf(element)
                    database[index] = user = {
                        id,
                        ...user
                    }
                }
            })

            res.status(200).json({
                status: 200,
                message: "Updated the user"
            })

            console.log("Updated a user by id")
        } else {
            if (Object.keys(req.body).length === 0) {
                res.status(400).json({
                    status: 400,
                    message: "No saveable user data"
                })

                console.log("No saveable user data")
            } else if (uniqueEmail == false) {
                res.status(409).json({
                    status: 409,
                    message: "Emailadress already taken"
                })

                console.log("Emailadress already taken")
            } else if (existingId == false) {
                res.status(404).json({
                    status: 404,
                    message: `User with id ${id} not found`
                })

                console.log(`User with id ${id} not found`)
            }
        }

        res.end()
    },
    deleteUser: (req, res) => {
        const id = req.params.id
        let boolean = false

        database.forEach(element => {
            if (element.id == id) {
                boolean = true
            }
        })

        if (boolean == true) {
            database = database.filter((item) => item.id != id)

            res.status(200).json({
                status: 200,
                message: "Deleted the user"
            })

            console.log("Deleted a user by id")
        } else {
            res.status(404).json({
                status: 404,
                message: `User with id ${id} not found`
            })

            console.log(`User with id ${id} not found`)
        }

        res.end()
    }
}

module.exports = controller