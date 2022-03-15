//import database
const openDb = require('../Shared/db.js');

module.exports = async function (context, req) {

    try{
        //get the database
        const db = await openDb();

        //delete the statement based on the date
        await db.run(`DELETE FROM account_statements WHERE date = $date`, {
            $date: req.body.date
        });

        //return the response
        context.res = {
            status: 200,
            body: `Successfully deleted statement with date ${req.body.date}`
        };
    }
    catch(err){
        context.res = {
            status: 500,
            body: "Internal Server Error"
        };
    }
    
}