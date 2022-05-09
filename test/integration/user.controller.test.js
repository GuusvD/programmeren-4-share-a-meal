const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')

chai.should()
chai.use(chaiHttp)

describe('Manage users', () => {
    describe('UC-201: Registreren als nieuwe gebruiker', () => {
        it('TC-201-1: Verplicht veld ontbreekt', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //Firstname is missing
                    lastName: "Doe",
                    emailAdress: "john.doe@server.com",
                    password: "secret",
                    street: "Lovensdijkstraat 61",
                    city: "Breda"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.a('string').that.equals('Firstname must be a string!')
                    done()
                })
        })

        it('TC-201-4: Gebruiker bestaat al', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //Already existing emailadress in database
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "j.doe@server.com"
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
                    password: "secret",
                    emailAdress: "john.doe@server.com"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(201)
                    result.firstName.should.be.a('string').that.equals('John')
                    result.lastName.should.be.a('string').that.equals('Doe')
                    done()
                })
        })
    })

    describe('UC-204: Details van gebruiker', () => {
        it('TC-204-2: Gebruiker-ID bestaat niet', (done) => {
            chai
                .request(server)
                //Non-existent user-id "0"
                .get('/api/user/0')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(404)
                    message.should.be.an('string').that.equals('User does not exist')
                    done()
                })
        })

        it('TC-204-3: Gebruiker-ID bestaat', (done) => {
            chai
                .request(server)
                //Existing user-id "1"
                .get('/api/user/1')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.length.should.equals(1)
                    done()
                })
        })
    })

    describe('UC-205: Gebruiker wijzigen', () => {
        it('TC-205-1: Verplicht veld ontbreekt', (done) => {
            chai
                .request(server)
                .put('/api/user/1')
                .send({
                    //Emailadress is missing
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.an('string').that.equals('Emailadress must be a string!')
                    done()
                })
        })

        it('TC-205-4: Gebruiker bestaat niet', (done) => {
            chai
                .request(server)
                //Non-existing user-id "0"
                .put('/api/user/0')
                .send({
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "john.doe@server.com"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.an('string').that.equals('User does not exist')
                    done()
                })
        })

        it('TC-205-6: Gebruiker succesvol gewijzigd', (done) => {
            chai
                .request(server)
                //Existing user-id "1"
                .put('/api/user/1')
                .send({
                    //Adds street and city to the user
                    firstName: "Mariëtte",
                    lastName: "van den Dullemen",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "m.vandullemen@server.com",
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.firstName.should.be.a('string').that.equals('Mariëtte')
                    result.lastName.should.be.a('string').that.equals('van den Dullemen')
                    result.street.should.be.a('string').that.equals('Lovensdijkstraat 61')
                    result.city.should.be.a('string').that.equals('Breda')
                    result.password.should.be.a('string').that.equals('secret')
                    result.emailAdress.should.be.a('string').that.equals('m.vandullemen@server.com')
                    done()
                })
        })
    })

    describe('UC-206: Gebruiker verwijderen', () => {
        it('TC-206-1: Gebruiker bestaat niet', (done) => {
            chai
                .request(server)
                //Non-existent user-id "0"
                .delete('/api/user/0')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.an('string').that.equals('User does not exist')
                    done()
                })
        })

        it('TC-206-4: Gebruiker succesvol verwijderd', (done) => {
            chai
                .request(server)
                //Existing user-id "5"
                .delete('/api/user/5')
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