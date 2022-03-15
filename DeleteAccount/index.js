//import db
const openDb = require('../Shared/db.js'); 

module.exports = async function (context, req) {
    try{
        const db = await openDb();

        //delete the account based on the id
        await db.run(`DELETE FROM accounts WHERE id = $id`, {
            $id: req.body.account_id
        });

        //return the response
        context.res = {
            status: 200,
            body: `Successfully deleted account with id ${req.body.account_id}`
        };
    }
    catch(err){
        context.res = {
            status: 500,
            body: "Internal Server Error"
        };
    }
}