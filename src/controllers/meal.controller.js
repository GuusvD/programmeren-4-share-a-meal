const dbconnection = require('../../database/dbconnection')

let controller = {
    getAllMeals: (req, res) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err // Not connected!

            // Use the connection.
            connection.query('SELECT id, name FROM meal', function (error, results, fields) {
                // When done with the connection, release it.
                connection.release()

                // Handle error after the release.
                if (error) throw error

                // Don't use the connection here, it has been returned to the pool.
                // Log results amount.
                console.log('results: ', results.length)

                // Return the results with the status code.
                res.status(200).json({
                    status: 200,
                    results: results
                })

                // Close the pool.
                // dbconnection.end((err) => {
                //     console.log('pool was closed')
                // })
            })
        })
    }
}

module.exports = controller