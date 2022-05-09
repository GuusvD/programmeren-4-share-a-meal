const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')

chai.should()
chai.use(chaiHttp)

describe('Manage users', () => {
    describe('UC-201 Registreren als nieuwe gebruiker', () => {
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
                    city: "Breda",
                    phoneNumber: "06-12345678"
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
                    emailAdress: "j.doe@server.com",
                    phoneNumber: "06-12345678"
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
                    emailAdress: "john.doe@server.com",
                    phoneNumber: "06-12345678"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.firstName.should.be.a('string').that.equals('John')
                    result.lastName.should.be.a('string').that.equals('Doe')
                    result.street.should.be.a('string').that.equals('Lovensdijkstraat 61')
                    result.city.should.be.a('string').that.equals('Breda')
                    result.password.should.be.a('string').that.equals('secret')
                    result.emailAdress.should.be.a('string').that.equals('john.doe@server.com')
                    done()
                })
        })
    })

    describe('UC-204 Details van gebruiker', () => {
        it('TC-204-2: Gebruiker-ID bestaat niet', (done) => {
            chai
                .request(server)
                //Non-existent user-id "0"
                .get('/api/user/0')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(404)
                    message.should.be.an('string').that.equals('User with id 0 not found')
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
})