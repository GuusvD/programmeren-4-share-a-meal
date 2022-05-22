const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const jwt = require("jsonwebtoken")
const { expect } = require('chai')
const jwtSecretKey = require("../../src/config/config").jwtSecretKey

chai.should()
chai.use(chaiHttp)

describe('Validatie', () => {
    describe('UC-101: Login', () => {
        it('TC-101-1: Verplicht veld ontbreekt', (done) => {
            chai
                .request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "m.vandullemen@server.nl"
                    //Missing password
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.a('string').that.equals('Password must be a string!')
                    done()
                })
        })

        it('TC-101-2: Niet-valide email adres', (done) => {
            chai
                .request(server)
                .post('/api/auth/login')
                .send({
                    //Not valid emailadress, must be a string and not numbers
                    emailAdress: 1234,
                    password: "secret"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.a('string').that.equals('Emailadress must be a string!')
                    done()
                })
        })

        it('TC-101-3: Niet-valide wachtwoord', (done) => {
            chai
                .request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "m.vandullemen@server.nl",
                    //Not valid password, must be a string and not numbers
                    password: 1234
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(400)
                    message.should.be.a('string').that.equals('Password must be a string!')
                    done()
                })
        })

        it('TC-101-4: Gebruiker bestaat niet', (done) => {
            chai
                .request(server)
                .post('/api/auth/login')
                .send({
                    //Non-existing email in database so user does not exist
                    emailAdress: "abc@server.nl",
                    password: "secret"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equals(404)
                    message.should.be.a('string').that.equals('User not found or password invalid!')
                    done()
                })
        })

        it('TC-101-5: Gebruiker succesvol ingelogd', (done) => {
            chai
                .request(server)
                .post('/api/auth/login')
                .send({
                    //All existing user data so login succeeds
                    emailAdress: "m.vandullemen@server.nl",
                    password: "secret"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    expect(result.id).to.equal(1)
                    expect(result.emailAdress).to.equal("m.vandullemen@server.nl")
                    expect(result.firstName).to.equal("Mariëtte")
                    expect(result.lastName).to.equal("van den Dullemen")
                    result.token.should.be.a('string')
                    done()
                })
        })
    })
})