const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')

//Get all meals
router.get('/api/meal', mealController.getAllMeals)

//Get meal by id
router.get('/api/meal/:id', mealController.getMealById)

module.exports = router