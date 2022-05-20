const dbconnection = require('../../database/dbconnection')

let controller = {
    getAllMeals: (req, res) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query('SELECT * FROM meal', function (error, results, fields) {
                connection.release()

                if (error) throw error

                res.status(200).json({
                    status: 200,
                    results: results
                })
            })
        })
    }
}

module.exports = controller