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
    },
    getMealById: (req, res) => {
        const id = req.params.id

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(`SELECT * FROM meal WHERE id = ${id}`, function (error, results, fields) {
                connection.release()

                if (error) throw error

                if (results.length == 0) {
                    res.status(404).json({
                        status: 404,
                        message: `Meal does not exist`
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        result: results[0]
                    })
                }
            })
        })
    }
}

module.exports = controller