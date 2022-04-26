const express = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')
const app = express()
const port = process.env.PORT || 3000
const userRouter = require('./src/routes/user.routes')

const bodyparser = require("body-parser")
app.use(bodyparser.json())

app.use(userRouter)

app.listen(port, () => {
  console.log(`Share-a-meal app listening on port ${port}`)
})

//Error handling
app.use((err, req, res, next) => {
  res.status(err.status).json(err)
})

module.exports = app