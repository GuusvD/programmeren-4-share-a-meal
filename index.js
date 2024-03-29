require('dotenv').config()
const express = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')
const app = express()
const port = process.env.PORT
const userRouter = require('./src/routes/user.routes')
const mealRouter = require('./src/routes/meal.routes')
const authRouter = require('./src/routes/auth.routes')
const bodyparser = require("body-parser")

app.use(bodyparser.json())
app.use(userRouter)
app.use(mealRouter)
app.use(authRouter)

app.listen(port, () => {
  console.log(`Share-a-meal app listening on port ${port}`)
})

//Response for all non-existent end-points
app.all('*', (req, res) => {
  res.status(401).json({
    status: 401,
    message: 'End-point not found'
  })
})

//Response for all non-existing end-points for user data interactions
app.all('/api/user/undefined', (req, res) => {
  res.status(401).json({
    status: 401,
    message: 'End-point not found'
  })
})

//Error handling
app.use((err, req, res, next) => {
  res.status(err.status).json({
    status: err.status,
    message: err.message
  })
})

module.exports = app