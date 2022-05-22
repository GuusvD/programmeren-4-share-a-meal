
# Share-A-Meal API

This is an API created by Guus van Damme with Node.js and deployed with help of Heroku. The IDE used for creating this program is Visual Studio Code.



## Table of contents

- Description
- Installation
- Usage
- API routes
- Tests
- FAQ
## Description

The Share-A-Meal API (or Application Programming Interface) has 
been created for a specific purpose, namely the creating and 
sharing of meals! To connect people around the world I developed 
an API that can be used to easily share meals with other users 
so everyone can enjoy different kinds of cuisines from all parts 
and corners in the world...
## Installation

So how does one install this program? Well I will explain this
in some simple steps.

- First install the project folder from my GitHub repository called: programmeren-4-share-a-meal. You can do this by clicking the green "Code" button on the right of the screen and then clicking on "Download ZIP". Your computer will start the download and once it's finished you can move on to the next step.

- Install all required NPM packages by running the following commmand in for example cmder while you are in the project folder:

```bash
  npm install
```

- And you're good to go!
## Usage

#### Running locally on pc

- Using XAMPP start a local MySql server.
- Start the API by typing the following command while you are again in the project folder:

```bash
  node index.js
```

- The API is now running locally! Send requests by visiting http://localhost:3000/ in your browser or by using Postman. Postman is an API platform for building and using APIs. You can get it here for Windows: https://www.postman.com/downloads/?utm_source=postman-home.

#### Online usage

- Simply type https://programmeren-4-share-a-meal.herokuapp.com/ in your browser or Postman and you can send any request described in the API routes chapter in this README.
## API routes

The following tables show a overview of API routes you can add
at the end of the API link (https://programmeren-4-share-a-meal.herokuapp.com/)
to perform a specific action on the data in the online connected SQL database.

_NOTE: almost all functions require a token, you can get one by
sending a POST request to the below Login route with a valid
user email address and password of a existing user in the database._

#### Login route

For getting a token which is needed for performing many actions
in the API.

|Request type|Endpoints|Description
|---|---|---|
|POST| /api/auth/login | Get a token


#### User routes

For getting, creating, updating and deleting user data.

|Request type|Endpoints|Description
|---|---|---|
|GET| /api/user/profile | Get user profile
|GET| /api/user/{id} | Get user by id
|GET| /api/user | Get all users
|POST| /api/user | Create a user
|PUT| /api/user/{id} | Update a user by id
|DELETE| /api/user/{id} | Delete a user by id


#### Meal routes

For getting, creating and deleting meal data.

|Request type|Endpoints|Description
|---|---|---|
|GET| /api/meal | Get all meals
|GET| /api/meal/{id} | Get meal by id
|POST| /api/meal | Create a new meal
|DELETE| /api/meal/{id} | Delete a meal by id


## Tests

To ensure this API performs as it should I created quite a lot
of tests to quality check the program so I know it can be used
efficiently and reliably by many users.

This project also carries some tests with it in the project
folder so users themselves can test the quality of the program.

To run all of the tests in the folder type the following command
in for example cmder and watch the outcomes in that console.

```bash
  npm run test
```
## FAQ

#### Is this API free to use?

Yes. This program will always be freely usable by anyone on the
internet.

#### How long did the development take?

Approximately a month total with some breaks.

#### What is your current profession?

Well I'm still a student. I was born in the Netherlands and I
ofcourse also go to school there. I'm now studying Computer science
at the Avans University of Applied Sciences.

#### Do you plan to create and distribute more programs?

At the moment I have no plans to create and distribute another
application, but this will probably change as I go on with my study.

