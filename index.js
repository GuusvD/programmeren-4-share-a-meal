const express = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')
const app = express()
const port = process.env.PORT || 3000

const bodyparser = require("body-parser")
app.use(bodyparser.json())

let database = []
let id = 0

app.listen(port, () => {
  console.log(`Share-a-meal app listening on port ${port}`)
})

// //Get all users
// app.get('/api/user', (req, res) => {
//   let text;

//   for (let index = 0; index < userArray.length; index++) {
//     text += JSON.stringify(userArray[index])
//   }

//   res.send(text)

//   console.log("Got all the Users")

//   res.end()
// })

//Get user profile
app.get('/api/user/profile', (req, res) => {
  console.log("Got the User profile")
  res.send("Got the User profile")

  res.end()
})

//Get user by id
app.get('/api/user/:userId', (req, res) => {
  if (req.params.userId > userArray.length - 1) {
    console.log("Couldn't find the User")
    res.send("Couldn't find the User")
  } else {
    res.send(userArray[req.params.userId])
    console.log("Got the User by id")
  }

  res.end()
})

//Register a new user
app.post("/api/user", (req, res) => {
  let user = req.body
  id++
  user = {
    id,
    ...user,
  }
  database.push(user)

  console.log("Added a new User:")
  console.log(database)

  res.status(201).json({
    status: 201,
    result: user
  })

  res.end()
})

app.get("/api/user", (req, res) => {

  res.status(200).json({
    status: 200,
    result: database
  })

  res.end()
})

app.get("/api/meal/:id", (req, res) => {
  const id = req.params.id
  let meal = database.filter((item) => item.id == id)

  if (meal.length > 0) {
    console.log(meal)
    res.status(200).json({
      status: 200,
      result: meal
    })
  } else {
    res.status(404).json ({
      status: 404,
      result: `Meal with id ${id} not found`
    })
  }

  res.end()
})

app.put("/api/user", (req, res) => {
  console.log("Updated a User by id")
  res.send("Updated a User by id")

  res.end()
})

app.delete("/api/user", (req, res) => {
  console.log("Deleted a User by id")
  res.send("Deleted a User by id")

  res.end()
})