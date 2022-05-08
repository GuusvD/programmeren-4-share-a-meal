const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')

chai.should()
chai.use(chaiHttp)

describe('Manage users', () => {
    // describe('UC-201 Registreren als nieuwe gebruiker', () => {
    //     it('TC-201-1: Verplicht veld ontbreekt', (done) => {
    //         chai
    //             .request(server)
    //             .post('/api/user')
    //             .send({
    //                 //Firstname is missing
    //                 lastName: "Doe",
    //                 street: "Lovensdijkstraat 61",
    //                 city: "Breda",
    //                 password: "secret",
    //                 emailAdress: "john.doe@server.com"
    //             })
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equals(400)
    //                 message.should.be.a('string').that.equals('Firstname must be a string!')
    //                 done()
    //             })
    //     })

    //     it('TC-201-2: Niet-valide email adres', (done) => {
    //         chai
    //             .request(server)
    //             .post('/api/user')
    //             .send({
    //                 //Emailadress is not a real email and is not a string
    //                 firstName: "John",
    //                 lastName: "Doe",
    //                 street: "Lovensdijkstraat 61",
    //                 city: "Breda",
    //                 password: "secret",
    //                 emailAdress: 1234
    //             })
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equals(400)
    //                 message.should.be.a('string').that.equals('Emailadress must be a string!')
    //                 done()
    //             })
    //     })

    //     it('TC-201-3: Niet-valide wachtwoord', (done) => {
    //         chai
    //             .request(server)
    //             .post('/api/user')
    //             .send({
    //                 //Password is not a string
    //                 firstName: "John",
    //                 lastName: "Doe",
    //                 street: "Lovensdijkstraat 61",
    //                 city: "Breda",
    //                 password: 1234,
    //                 emailAdress: "john.doe@server.com"
    //             })
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equals(400)
    //                 message.should.be.a('string').that.equals('Password must be a string!')
    //                 done()
    //             })
    //     })

    //     it('TC-201-4: Gebruiker bestaat al', (done) => {
    //         chai
    //             .request(server)
    //             .post('/api/user')
    //             .send({
    //                 //Already existing emailadress in database
    //                 firstName: "John",
    //                 lastName: "Doe",
    //                 street: "Lovensdijkstraat 61",
    //                 city: "Breda",
    //                 password: "secret",
    //                 emailAdress: "j.doe@server.com"
    //             })
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equals(409)
    //                 message.should.be.a('string').that.equals('Emailadress already taken')
    //                 done()
    //             })
    //     })

    //     it('TC-201-5: Gebruiker succesvol geregistreerd', (done) => {
    //         chai
    //             .request(server)
    //             .post('/api/user')
    //             .send({
    //                 firstName: "John",
    //                 lastName: "Doe",
    //                 street: "Lovensdijkstraat 61",
    //                 city: "Breda",
    //                 password: "secret",
    //                 emailAdress: "john.doe@server.com"
    //             })
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, result } = res.body
    //                 status.should.equals(200)
    //                 result.firstName.should.be.a('string').that.equals('John')
    //                 result.lastName.should.be.a('string').that.equals('Doe')
    //                 result.street.should.be.a('string').that.equals('Lovensdijkstraat 61')
    //                 result.city.should.be.a('string').that.equals('Breda')
    //                 result.password.should.be.a('string').that.equals('secret')
    //                 result.emailAdress.should.be.a('string').that.equals('john.doe@server.com')
    //                 done()
    //             })
    //     })
    // })

    describe('UC-202 Overzicht van gebruikers', () => {
        // it('TC-202-1: Toon nul gebruikers', (done) => {
        //     chai
        //         .request(server)
        //         .get('/api/user')
        //         .end((err, res) => {
        //             res.should.be.an('object')
        //             let { status, result } = res.body
        //             status.should.equals(200)
        //             result.length.should.equals(0)
        //             done()
        //         })
        // })

        // it('TC-202-2: Toon twee gebruikers', (done) => {
        //     chai
        //         .request(server)
        //         .get('/api/user')
        //         .end((err, res) => {
        //             res.should.be.an('object')
        //             let { status, result } = res.body
        //             status.should.equals(200)
        //             result.length.should.equals(2)
        //             done()
        //         })
        // })

        // it('TC-202-3: Toon gebruikers met zoekterm op niet-bestaande naam', (done) => {
        //     chai
        //         .request(server)
        //         .get('/api/user')
        //         .end((err, res) => {
        //             res.should.be.an('object')
        //             let { status, result } = res.body
        //             status.should.equals(200)
        //             result.length.should.equals(0)
        //             done()
        //         })
        // })

        // it('TC-202-4: Toon gebruikers met gebruik van de zoekterm op het veld actief = false', (done) => {
        //     chai
        //         .request(server)
        //         .get('/api/user')
        //         .end((err, res) => {
        //             res.should.be.an('object')
        //             let { status } = res.body
        //             status.should.equals(200)
        //             done()
        //         })
        // })

        // it('TC-202-5: Toon gebruikers met gebruik van de zoekterm op het veld actief = true', (done) => {
        //     chai
        //         .request(server)
        //         .get('/api/user')
        //         .end((err, res) => {
        //             res.should.be.an('object')
        //             let { status } = res.body
        //             status.should.equals(200)
        //             done()
        //         })
        // })

        // it('TC-202-6: Toon gebruikers met zoekterm op bestaande naam', (done) => {
        //     chai
        //         .request(server)
        //         .get('/api/user')
        //         .end((err, res) => {
        //             res.should.be.an('object')
        //             let { status } = res.body
        //             status.should.equals(200)
        //             done()
        //         })
        // })
    })
})