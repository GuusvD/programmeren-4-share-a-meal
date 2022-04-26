const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

//Get user by id
router.get('/api/user/:id', userController.getUserById)

//Register a new user
router.post("/api/user", userController.addUser)

//Get all users
router.get("/api/user", userController.getAllUsers)

//Get user profile
router.get('/api/user/profile', userController.getUserProfile)

//Update a user
router.put("/api/user/:id", userController.updateUser)

//Delete a user
router.delete("/api/user/:id", userController.deleteUser)

module.exports = router