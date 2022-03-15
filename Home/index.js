// Files /Home/index.js and /Home/renderHtml.js are the most complicated files in this project.
// They are definitely prime candidates for refactoring and clarifying if I were to invest more time into this
// proof-of-concept project.

const openDb = require('../Shared/db.js');
const renderHtml = require('./renderHtml.js');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const db = await openDb();

    const statements = await db.all(`SELECT account_statements.id, account_id, amount, date(date) as date FROM accounts INNER JOIN account_statements ON accounts.id = account_statements.account_id ORDER BY date(date) DESC;`);
    const dateObjects = await db.all(`SELECT date(date) as date FROM account_statements GROUP BY date(date) ORDER BY date(date) DESC;`);
    const accounts = await db.all(`SELECT * FROM accounts;`);

    //the following code formats the data to be easily rendered as an HTML table in renderHtml.js

    //create header row containing account titles
    let headerRow = [{title:"Total", id: null}];
    for (account of accounts){
        headerRow.push({
            title: account.title,
            id: account.id
        });
    }
    
    //rows contain date (first column) and data for each date (remaining columns)
    let rows = [];
    //create header column
    for (dateObject of dateObjects) {
        rows.push([dateObject.date]);
    }

    //create temp object to hold the statements for each account by date
    let statements_by_date = {};
    for (statement of statements) {
        if (statements_by_date[statement.date] === undefined) {
            statements_by_date[statement.date] = {};
        }
        statements_by_date[statement.date][statement.account_id] = statement.amount;
    }

    //add totals to statements by dates
    for (date in statements_by_date) {
        let total = 0;
        for (account_id in statements_by_date[date]) {
            total += statements_by_date[date][account_id];
        }
        statements_by_date[date]["Total"] = total;
    }

    //create xy values array for chart
    let xyValues = [];
    for (date in statements_by_date) {
        xyValues.push([date, statements_by_date[date]["Total"]]);
    }

    //populate entire table & add totals to beginning of each row
    for (let i = 0; i<rows.length; i++) {
        let total = 0;
        for (account of accounts){
            if(statements_by_date && statements_by_date[rows[i][0]] && statements_by_date[rows[i][0]][account.id] !== undefined){
                rows[i].push(statements_by_date[rows[i][0]][account.id]);
                total += statements_by_date[rows[i][0]][account.id];
            }
            else{
                rows[i].push(null);
            }
        }
        //adds total to beginning of row (after date)
        rows[i].splice(1, 0, total);
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        headers: {
            'Content-Type': 'text/html'
        },
        body: renderHtml(accounts, statements, rows, headerRow, xyValues)
    };
}