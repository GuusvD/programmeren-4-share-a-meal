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

//Get user profile
app.get('/api/user/profile', (req, res) => {
  res.send("This function has not yet been implemented")

  console.log("Not implemented")
  res.end()
})

//Get user by id
app.get('/api/user/:id', (req, res) => {
  const id = req.params.id
  let user = database.filter((item) => item.id == id)

  if (user.length > 0) {
    res.status(200).json({
      status: 200,
      result: user
    })

    console.log("Got the user by id")
  } else {
    res.status(401).json({
      status: 404,
      result: `User with id ${id} not found`
    })

    console.log("Couldn't find a user with that id")
  }
})

//Register a new user
app.post("/api/user", (req, res) => {
  let user = req.body
  
  if (user.length > 0) {
    id++

    user = {
      id,
      ...user,
    }

    database.push(user)

    res.status(201).json({
      status: 201,
      result: user
    })

    console.log("Added a new user:")
    console.log(user)
  } else {
    res.status(400).json({
      status: 400,
      message: "No saveable user data"
    })

    console.log("No user data")
  }

  res.end()
})

//Get all users
app.get("/api/user", (req, res) => {

  if (database.length > 0) {
    res.status(200).json({
      status: 200,
      result: database
    })

    console.log("Got all the users")
  } else {
    res.status(404).json({
      status: 404,
      message: "Database is empty"
    })
  }
  res.end()
})

//Update a user
app.put("/api/user/:id", (req, res) => {


  console.log("Updated a user by id")
  res.send("Updated a user by id")

  res.end()
})

//Delete a user
app.delete("/api/user/:id", (req, res) => {
  const id = req.params.id
  let boolean = "N"

  database.forEach(element => {
    if (element.id == id) {
      boolean = "Y"
    }
  });

  if (boolean == "Y") {
    database.indexOf.filter((item) => item.id == id) = null;

    res.status(200).json({
      status: 200,
      message: "Deleted the user"
    })

    console.log("Deleted a user by id")
  } else {
    res.status(404).json({
      status: 404,
      message: "Couldn't find the user"
    })

    console.log("Couldn't find the user")
  }

  res.end()
})