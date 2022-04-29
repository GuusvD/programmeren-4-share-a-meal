require('dotenv').config()
const express = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')
const app = express()
const port = process.env.PORT
const userRouter = require('./src/routes/user.routes')
const mealRouter = require('./src/routes/meal.routes')
const bodyparser = require("body-parser")

app.use(bodyparser.json())
app.use(userRouter)
app.use(mealRouter)

app.listen(port, () => {
  console.log(`Share-a-meal app listening on port ${port}`)
})

//Error handling
app.use((err, req, res, next) => {
  res.status(err.status).json(err)
})

module.exports = app