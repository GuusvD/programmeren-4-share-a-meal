const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')

//Get user profile
router.get('/api/user/profile', authController.validateToken, userController.getUserProfile)

//Get user by id
router.get('/api/user/:id', authController.validateToken, userController.getUserById)

//Register a new user
router.post("/api/user", userController.validateUserInsert, userController.addUser)

//Get all users
router.get("/api/user", authController.validateToken, userController.getAllUsers)

//Update a user
router.put("/api/user/:id", authController.validateToken, userController.validateUserUpdate, userController.updateUser)

//Delete a user
router.delete("/api/user/:id", authController.validateToken, userController.deleteUser)

module.exports = router