const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
let database

chai.should()
chai.use(chaiHttp)

describe('Manage users', () => {
    describe('UC-201 add user /api/user', () => {
        beforeEach((done) => {
            database = []
            done()
        })

        it('When a required input is missing, a valid error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //Firstname is missing
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
                    message.should.be.a('string').that.equals('Firstname must be a string!')
                })
            done()
        })
    })
})