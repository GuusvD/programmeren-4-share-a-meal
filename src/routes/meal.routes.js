const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/auth.controller')

//Get all meals
router.get('/api/meal', mealController.getAllMeals)

//Get meal by id
router.get('/api/meal/:id', mealController.getMealById)

//Add a new meal
router.post('/api/meal', authController.validateToken, mealController.validateMealInsert, mealController.addMeal)

module.exports = router