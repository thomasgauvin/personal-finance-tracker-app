const openDb = require('../Shared/db.js');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try{
        const db = await openDb();

        if(req.body.account_title === "" || req.body.account_title === undefined){
            throw new Error("Account title is required");
        }

        //insert into accounts table
        await db.run(`INSERT INTO accounts (title) VALUES ($account_title)`, {
            $account_title: req.body.account_title
        });
    
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: `Created Account ${req.body.account_title} Successfully`
        };
        
    } catch(err){
        context.res = {
            status: 500,
            body: "Internal Server Error"
        };
    }
}