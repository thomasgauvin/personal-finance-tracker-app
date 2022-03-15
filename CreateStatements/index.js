const openDb = require('../Shared/db.js');

//function to validate date
function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
}

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try{
        const db = await openDb();

        //insert statements into account_statements table
        for (statement of req.body.statements) {
            //validate that statements values are cleaned for database
            if(statement.account_id === "" || statement.account_id === undefined || statement.amount === "" || statement.amount === undefined || statement.date === "" || statement.date === undefined){
                continue;
            }
            if(!isValidDate(new Date(statement.date))){
                continue;
            }
            
            //insert the statement into the database
            await db.run(`INSERT INTO account_statements (account_id, amount, date) VALUES ($statement_account_id, $statement_amount, $statement_date)`, {
                $statement_account_id: statement.account_id,
                $statement_amount: statement.amount,
                $statement_date: new Date(statement.date).toISOString().slice(0, 10)
            });
        }
    
        context.res = {
            // status: 200, /* Defaults to 200 */
            status: 201,
            body: `Successfully created statements`
        };
        
    } catch(err){
        context.res = {
            status: 500,
            body: "Internal Server Error"
        };
    }
}