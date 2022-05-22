const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const jwt = require("jsonwebtoken")
const jwtSecretKey = require("../../src/config/config").jwtSecretKey
const dbconnection = require('../../database/dbconnection')

chai.should()
chai.use(chaiHttp)

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE
const INSERT_USERS = "INSERT INTO `user` VALUES (1,'Mariëtte','van den Dullemen',1,'m.vandullemen@server.nl','secret','','','',''),(2,'John','Doe',1,'j.doe@server.com','secret','06 12425475','editor,guest','',''),(3,'Herman','Huizinga',1,'h.huizinga@server.nl','secret','06-12345678','editor,guest','',''),(4,'Marieke','Van Dam',0,'m.vandam@server.nl','secret','06-12345678','editor,guest','',''),(5,'Henk','Tank',1,'h.tank@server.com','secret','06 12425495','editor,guest','','');"
const INSERT_MEALS = "INSERT INTO `meal` VALUES (1,1,0,0,1,'2022-03-22 17:35:00',4,12.75,'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',1,'2022-02-26 18:12:40.048998','2022-04-26 12:33:51.000000','Pasta Bolognese met tomaat, spekjes en kaas','Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!','gluten,lactose'),(2,1,1,0,0,'2022-05-22 13:35:00',4,12.75,'https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg',2,'2022-02-26 18:12:40.048998','2022-04-25 12:56:05.000000','Aubergine uit de oven met feta, muntrijst en tomatensaus','Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.','noten'),(3,1,0,0,1,'2022-05-22 17:30:00',4,10.75,'https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg',2,'2022-02-26 18:12:40.048998','2022-03-15 14:10:19.000000','Spaghetti met tapenadekip uit de oven en frisse salade','Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.','gluten,lactose'),(4,1,0,0,0,'2022-03-26 21:22:26',4,4.00,'https://static.ah.nl/static/recepten/img_063387_890x594_JPG.jpg',3,'2022-03-06 21:23:45.419085','2022-03-12 19:51:57.000000','Zuurkool met spekjes','Heerlijke zuurkoolschotel, dé winterkost bij uitstek. ',''),(5,1,1,0,1,'2022-03-26 21:24:46',6,6.75,'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',3,'2022-03-06 21:26:33.048938','2022-03-12 19:50:13.000000','Groentenschotel uit de oven','Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.','');"
const INSERT_PARTICIPANTS = "INSERT INTO `meal_participants_user` VALUES (1,2),(1,3),(1,5),(2,4),(3,3),(3,4),(4,2),(5,4);"

describe('Manage meals', () => {
    beforeEach((done) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            //Clear database and add standard records again
            connection.query(CLEAR_DB, function (error, results, fields) {
                if (error) throw error

                connection.query(INSERT_USERS + INSERT_MEALS + INSERT_PARTICIPANTS, function (error, results, fields) {
                    connection.release()

                    if (error) throw error

                    done()
                })
            })
        })
    })

    describe('UC-301: Maaltijd aanmaken', () => {
        it('TC-301-1: Verplicht veld ontbreekt', (done) => {
            chai
                .request(server)
                .post('/api/meal')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    //Missing name of meal
                    description: "Dé pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: false,
                    isVegan: false,
                    isToTakeHome: true,
                    dateTime: "2022-05-22T11:16:33.380Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: ["gluten", "noten", "lactose"],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.a('string').that.equals('Name must be a string!')
                    done()
                })
        })

        it('TC-301-2: Niet ingelogd', (done) => {
            chai
                .request(server)
                .post('/api/meal')
                //No .set so no token given so no login
                .send({
                    name: "Spaghetti Bolognese",
                    description: "Dé pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: false,
                    isVegan: false,
                    isToTakeHome: true,
                    dateTime: "2022-05-22T11:16:33.380Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: ["gluten", "noten", "lactose"],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(401)
                    message.should.be.a('string').that.equals('Unauthorized')
                    done()
                })
        })

        it('TC-301-3: Maaltijd succesvol toegevoegd', (done) => {
            chai
                //Everything is correct so post request succeeds
                .request(server)
                .post('/api/meal')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    name: "Spaghetti Bolognese",
                    description: "Dé pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: false,
                    isVegan: false,
                    isToTakeHome: true,
                    dateTime: "2022-05-22T17:18:33.935Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: ["gluten", "noten", "lactose"],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(201)
                    result.id.should.be.a('number').that.equals(6)
                    result.name.should.be.a('string').that.equals('Spaghetti Bolognese')
                    result.description.should.be.a('string').that.equals('Dé pastaklassieker bij uitstek.')
                    result.isActive.should.be.a('boolean').that.equals(true)
                    result.isVega.should.be.a('boolean').that.equals(false)
                    result.isVegan.should.be.a('boolean').that.equals(false)
                    result.isToTakeHome.should.be.a('boolean').that.equals(true)
                    result.dateTime.should.be.a('string').that.equals('2022-05-22T09:16:33.000Z')
                    result.imageUrl.should.be.a('string').that.equals('https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg')
                    result.allergenes.should.be.a('string').that.equals('gluten,lactose,noten')
                    result.maxAmountOfParticipants.should.be.a('number').that.equals(6)
                    result.price.should.be.a('string').that.equals('6.75')
                    done()
                })
        })
    })

    describe('UC-303: Lijst van maaltijden opvragen', () => {
        it('TC-303-1: Lijst van maaltijden geretourneerd', (done) => {
            chai
                .request(server)
                .get('/api/meal')
                //No token needed
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be.an('array')
                    //Standard 5 meals in database so array length is 5
                    result.length.should.be.a('number').that.equals(5)
                    done()
                })
        })
    })

    describe('UC-304: Details van een maaltijd opvragen', () => {
        it('TC-304-1: Maaltijd bestaat niet', (done) => {
            chai
                .request(server)
                //Not existing meal-id in database (standard 5 meals in database)
                .get('/api/meal/6')
                //No token needed
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(404)
                    message.should.be.a('string').that.equals('Meal does not exist')
                    done()
                })
        })

        it('TC-304-2: Details van maaltijd geretourneerd', (done) => {
            chai
                .request(server)
                //Existing meal-id in database
                .get('/api/meal/1')
                //No token needed
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be.an('object')
                    result.id.should.be.a('number').that.equals(1)
                    result.name.should.be.a('string').that.equals('Pasta Bolognese met tomaat, spekjes en kaas')
                    result.description.should.be.a('string').that.equals('Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!')
                    result.isActive.should.be.a('boolean').that.equals(true)
                    result.isVega.should.be.a('boolean').that.equals(false)
                    result.isVegan.should.be.a('boolean').that.equals(false)
                    result.isToTakeHome.should.be.a('boolean').that.equals(true)
                    result.dateTime.should.be.a('string').that.equals('2022-03-22T16:35:00.000Z')
                    result.imageUrl.should.be.a('string').that.equals('https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg')
                    result.allergenes.should.be.a('string').that.equals('gluten,lactose')
                    result.maxAmountOfParticipants.should.be.a('number').that.equals(4)
                    result.price.should.be.a('string').that.equals('12.75')

                    result.cook.should.be.an('object')
                    result.cook.id.should.be.a('number').that.equals(1)
                    result.cook.firstName.should.be.a('string').that.equals('Mariëtte')
                    result.cook.lastName.should.be.a('string').that.equals('van den Dullemen')
                    result.cook.street.should.be.a('string').that.equals('')
                    result.cook.city.should.be.a('string').that.equals('')
                    result.cook.password.should.be.a('string').that.equals('secret')
                    result.cook.emailAdress.should.be.a('string').that.equals('m.vandullemen@server.nl')
                    result.cook.phoneNumber.should.be.a('string').that.equals('')

                    result.participants.should.be.an('array')
                    result.participants.length.should.be.a('number').that.equals(3)
                    done()
                })
        })
    })

    describe('UC-305: Maaltijd verwijderen', () => {
        it('TC-305-2: Niet ingelogd', (done) => {
            chai
                .request(server)
                .delete('/api/meal/1')
                //No .set so no token given so no login
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(401)
                    message.should.be.a('string').that.equals('Unauthorized')
                    done()
                })
        })

        it('TC-305-3: Niet de eigenaar van de data', (done) => {
            chai
                .request(server)
                //Logged in user with id 1 wants to delete meal with id 2 that was created by another user, that is not possible
                .delete('/api/meal/2')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(403)
                    message.should.be.a('string').that.equals('Can not delete meals created by other users')
                    done()
                })
        })

        it('TC-305-4: Maaltijd bestaat niet', (done) => {
            chai
                .request(server)
                //Not existing meal-id in database
                .delete('/api/meal/6')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(404)
                    message.should.be.a('string').that.equals('Meal does not exist')
                    done()
                })
        })

        it('TC-305-5: Maaltijd succesvol verwijderd', (done) => {
            chai
                .request(server)
                //Existing meal-id in database
                .delete('/api/meal/1')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(200)
                    message.should.be.a('string').that.equals('Meal succesfully deleted')
                    done()
                })
        })
    })
})