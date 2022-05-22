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

describe('Manage users', () => {
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

    describe('UC-201: Registreren als nieuwe gebruiker', () => {
        it('TC-201-1: Verplicht veld ontbreekt', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //Firstname is missing
                    lastName: "Doe",
                    emailAdress: "john.doe@server.com",
                    password: "Secret1234",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    phoneNumber: "0612345678"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.a('string').that.equals('Firstname must be a string!')
                    done()
                })
        })

        it('TC-201-2: Niet-valide email adres', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "Secret1234",
                    //Not valid emailadress, must be a string not numbers
                    emailAdress: 1234,
                    phoneNumber: "0612345678"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.a('string').that.equals('Emailadress must be a string!')
                    done()
                })
        })

        it('TC-201-3: Niet-valide wachtwoord', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    //Not valid password, must be a string not numbers
                    password: 1234,
                    emailAdress: "john.doe@server.com",
                    phoneNumber: "0612345678"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.a('string').that.equals('Password must be a string!')
                    done()
                })
        })

        it('TC-201-4: Gebruiker bestaat al', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "Secret1234",
                    //Already existing emailadress in database
                    emailAdress: "j.doe@server.com",
                    phoneNumber: "0612345678"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(409)
                    message.should.be.a('string').that.equals('Emailadress already taken')
                    done()
                })
        })

        it('TC-201-5: Gebruiker succesvol geregistreerd', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //All unique data so no errors
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "Secret1234",
                    emailAdress: "john.doe@server.com",
                    phoneNumber: "0612345678"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(201)
                    result.should.be.an('object')
                    result.id.should.be.a('number').that.equals(6)
                    result.firstName.should.be.a('string').that.equals('John')
                    result.lastName.should.be.a('string').that.equals('Doe')
                    result.street.should.be.a('string').that.equals('Lovensdijkstraat 61')
                    result.city.should.be.a('string').that.equals('Breda')
                    result.password.should.be.a('string').that.equals('Secret1234')
                    result.emailAdress.should.be.a('string').that.equals('john.doe@server.com')
                    result.phoneNumber.should.be.a('string').that.equals('0612345678')
                    done()
                })
        })
    })

    describe('UC-202: Overzicht van gebruikers', () => {
        it('TC-202-1: Toon nul gebruikers', (done) => {
            chai
                .request(server)
                .get('/api/user?limit=0')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be.an('array')
                    result.length.should.be.a('number').that.equals(0)
                    done()
                })
        })

        it('TC-202-2: Toon twee gebruikers', (done) => {
            chai
                .request(server)
                .get('/api/user?limit=2')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be.an('array')
                    result.length.should.be.a('number').that.equals(2)
                    done()
                })
        })

        it('TC-202-3: Toon gebruikers met zoekterm op niet-bestaande naam', (done) => {
            chai
                .request(server)
                //Non existing firstname in de database
                .get('/api/user?firstName=Kees')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be.an('array')
                    result.length.should.be.a('number').that.equals(0)
                    done()
                })
        })

        it('TC-202-4: Toon gebruikers met gebruik van de zoekterm op het veld "isActive"=false', (done) => {
            chai
                .request(server)
                .get('/api/user?isActive=false')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be.an('array')
                    //There is only 1 not active user in database
                    result.length.should.be.a('number').that.equals(1)
                    done()
                })
        })

        it('TC-202-5: Toon gebruikers met gebruik van de zoekterm op het veld "isActive"=true', (done) => {
            chai
                .request(server)
                .get('/api/user?isActive=true')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be.an('array')
                    //There are 4 users that are active in the database
                    result.length.should.be.a('number').that.equals(4)
                    done()
                })
        })

        it('TC-202-6: Toon gebruikers met zoekterm op bestaande naam (max op 2 velden filteren)', (done) => {
            chai
                .request(server)
                .get('/api/user?firstName=John&lastName=Doe')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be.an('array')
                    //There is only 1 user with firstname "John" and lastname "Doe" in the database
                    result.length.should.be.a('number').that.equals(1)
                    done()
                })
        })
    })

    describe('UC-203: Gebruikersprofiel opvragen', () => {
        it('TC-203-1: Ongeldig token', (done) => {
            chai
                .request(server)
                .get('/api/user/profile')
                //Not a valid token
                .set('authorization', 'Bearer 1234')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(401)
                    message.should.be.a('string').that.equals('Invalid token!')
                    done()
                })
        })

        it('TC-203-2: Valide token en gebruiker bestaat', (done) => {
            chai
                .request(server)
                .get('/api/user/profile')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be.an('object')
                    //Id is 1 because that is the id of the user who is logged in
                    result.id.should.be.a('number').that.equals(1)
                    result.firstName.should.be.a('string').that.equals('Mariëtte')
                    result.lastName.should.be.a('string').that.equals('van den Dullemen')
                    result.street.should.be.a('string').that.equals('')
                    result.city.should.be.a('string').that.equals('')
                    result.password.should.be.a('string').that.equals('secret')
                    result.emailAdress.should.be.a('string').that.equals('m.vandullemen@server.nl')
                    result.phoneNumber.should.be.a('string').that.equals('')
                    done()
                })
        })
    })

    describe('UC-204: Details van gebruiker', () => {
        it('TC-204-1: Ongeldig token', (done) => {
            chai
                .request(server)
                .get('/api/user/1')
                //Not a valid token
                .set('authorization', 'Bearer 1234')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(401)
                    message.should.be.a('string').that.equals('Invalid token!')
                    done()
                })
        })

        it('TC-204-2: Gebruiker-ID bestaat niet', (done) => {
            chai
                .request(server)
                //Not existing user-id in database
                .get('/api/user/6')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(404)
                    message.should.be.a('string').that.equals('User does not exist')
                    done()
                })
        })

        it('TC-204-3: Gebruiker-ID bestaat', (done) => {
            chai
                .request(server)
                //Existing user-id in database
                .get('/api/user/2')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.id.should.be.a('number').that.equals(2)
                    result.firstName.should.be.a('string').that.equals('John')
                    result.lastName.should.be.a('string').that.equals('Doe')
                    result.street.should.be.a('string').that.equals('')
                    result.city.should.be.a('string').that.equals('')
                    result.password.should.be.a('string').that.equals('secret')
                    result.emailAdress.should.be.a('string').that.equals('j.doe@server.com')
                    result.phoneNumber.should.be.a('string').that.equals('06 12425475')
                    done()
                })
        })
    })

    describe('UC-205: Gebruiker wijzigen', () => {
        it('TC-205-1: Verplicht veld "emailAdress" ontbreekt', (done) => {
            chai
                .request(server)
                .put('/api/user/1')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    //Emailadress is missing
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "Secret1234"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.an('string').that.equals('Emailadress must be a string!')
                    done()
                })
        })

        it('TC-205-3: Niet-valide telefoonnummer', (done) => {
            chai
                .request(server)
                .put('/api/user/1')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    emailAdress: "m.vandullemen@server.nl",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "Secret1234",
                    //Not a correct and valid phonenumber
                    phoneNumber: "1234"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.an('string').that.equals('Phonenumber is not valid!')
                    done()
                })
        })

        it('TC-205-4: Gebruiker bestaat niet', (done) => {
            chai
                .request(server)
                //Not existing user-id in database
                .put('/api/user/6')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    emailAdress: "john.doe@server.com",
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "Secret1234"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.an('string').that.equals('User does not exist')
                    done()
                })
        })

        it('TC-205-5: Niet ingelogd', (done) => {
            chai
                .request(server)
                .put('/api/user/1')
                //No .set so no token given so no login
                .send({
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "Secret1234",
                    emailAdress: "j.doe@server.com",
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(401)
                    message.should.be.a('string').that.equals('Unauthorized')
                    done()
                })
        })

        it('TC-205-6: Gebruiker succesvol gewijzigd', (done) => {
            chai
                //Everything correct so put request succeeds
                .request(server)
                .put('/api/user/1')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send({
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "Secret1234",
                    emailAdress: "m.vandullemen@server.nl",
                    phoneNumber: "0612345678"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.id.should.be.a('number').that.equals(1)
                    result.firstName.should.be.a('string').that.equals('Mariëtte')
                    result.lastName.should.be.a('string').that.equals('van den Dullemen')
                    result.street.should.be.a('string').that.equals('Lovensdijkstraat 61')
                    result.city.should.be.a('string').that.equals('Breda')
                    result.password.should.be.a('string').that.equals('Secret1234')
                    result.emailAdress.should.be.a('string').that.equals('m.vandullemen@server.nl')
                    result.phoneNumber.should.be.a('string').that.equals('0612345678')
                    done()
                })
        })
    })

    describe('UC-206: Gebruiker verwijderen', () => {
        it('TC-206-1: Gebruiker bestaat niet', (done) => {
            chai
                .request(server)
                //Not existing user-id in database
                .delete('/api/user/6')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.an('string').that.equals('User does not exist')
                    done()
                })
        })

        it('TC-206-2: Niet ingelogd', (done) => {
            chai
                .request(server)
                .delete('/api/user/2')
                //No .set so no token given so no login
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(401)
                    message.should.be.an('string').that.equals('Unauthorized')
                    done()
                })
        })

        it('TC-206-3: Actor is geen eigenaar', (done) => {
            chai
                .request(server)
                //Logged in user with id 1 wants to delete user with id 2, that is not possible
                .delete('/api/user/2')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(403)
                    message.should.be.an('string').that.equals('Can not delete other users')
                    done()
                })
        })

        it('TC-206-4: Gebruiker succesvol verwijderd', (done) => {
            chai
                //Logged in user wants to delete his own account, that is possible
                .request(server)
                .delete('/api/user/5')
                .set('authorization', 'Bearer ' + jwt.sign({ userId: 5 }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(200)
                    message.should.be.an('string').that.equals('User succesfully deleted')
                    done()
                })
        })
    })
})