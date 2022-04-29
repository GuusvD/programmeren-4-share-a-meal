const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')

//Get all meals
router.get("/api/meal", mealController.getAllMeals)

module.exports = router