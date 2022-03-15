// Files /Home/index.js and /Home/renderHtml.js are the most complicated files in this project.
// They are definitely prime candidates for refactoring and clarifying if I were to invest more time into this
// proof-of-concept project.

function renderHtml(accounts, statements, rows, headerRow, xyValues){
    return(/*html*/`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Accounts</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.bundle.js"></script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                <style>
                    body{
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                    }

                    table input {
                        width: 8em;
                    }

                    #title{
                        max-width: 800px; 
                        width: 100%;
                        margin: auto; 
                        padding: 0.2em;
                        color: white;
                        font-size: 1.5em;
                        font-weight: 600;
                    }


                    #accounts td, #accounts th {
                        position: relative;
                    }

                    button.btn.btn-danger {
                        font-size: 8px; 
                        padding: 3px 6px;
                    }

                    th button.btn.btn-danger {
                        margin-left: 0.5em;
                    }

                    td.btn-container {
                        text-align: center;
                    }

                </style>
            </head>
            <body style="margin:0;">
            <div class="navbar bg-dark" id="title-bar">
                <div id="title">Personal Finance Tracker</div>
            </div>

            <div style="max-width: 800px; margin: auto; padding: 2em 1em; margin-bottom: 2em;">
                <div style="padding-bottom: 1em;">
                    <div style="padding-bottom: 1em; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: grey;">
                                Total balance
                            </div>
                            <div style="font-weight: 600; font-size: 1.8em">
                                <span id="total-balance">${new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(rows && rows[0] && rows[0][1]? rows[0][1] : 0)}</span>
                            </div>
                        </div>
                        <div>
                            <button id="6M" class="btn btn-light" onclick="changeXAxisMinDate('6M')">6M</button>
                            <button id="1Y" class="btn btn-light" onclick="changeXAxisMinDate('1Y')">1Y</button>
                            <button id="5Y" class="btn btn-light" onclick="changeXAxisMinDate('5Y')">5Y</button>
                            <button id="all" class="btn btn-dark" onclick="changeXAxisMinDate('all')">All</button>
                        </div>
                    </div>
                    <canvas id="canvas" style="display: block;" width="713" height="356"></canvas>
                </div>
                <h1 class="h4" style="padding: 0.5em 0;">Accounts history</h1>
                <div style="overflow-x: scroll; margin-bottom: 1em;">
                    <table style="width:100%; text-align:center;" id="accounts" class="table table-striped table-sm">
                        <!-- Table Header -->
                        <thead>
                            <tr>
                                <th></th>
                                <th>${headerRow[0].title}</th>
                                ${headerRow.slice(1).map(header => `
                                    <!-- Header for each account with delete button in corner -->
                                    <th>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>${header.title}</div>
                                        <button class="btn btn-danger" onclick="deleteAccount(${header.id})">X</button>
                                    </div>
                                    </th>
                                `).join('')}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Table First Row for entry of new data -->
                            <tr>
                                <td><input type="date" id="date"></td>
                                <td></td>
                                ${headerRow.slice(1).map(header => `
                                    <td><input type="number" class="input_values" id="${header.title.split(' ').join('_')}"></td>
                                `).join('')}
                                <!-- td for add button -->
                                <td><button class="btn btn-primary" onclick="submit()" style="padding: 0.2em 0.4em;">Add</button></td>
                            </tr>
                            <!-- Table Data Rows -->
                            ${rows.map(row => `
                                <tr>
                                    <!-- Date in bold -->
                                    <td style="font-weight: 600">
                                        ${row[0]}
                                    </td>
                                    ${row.slice(1).map(cell =>  `
                                        <td>${cell!==null? cell : ''}</td>
                                    `).join('')}
                                    <!-- td for delete button based on date -->
                                    <td class="btn-container"><button class="btn btn-danger" onclick="deleteRow('${row[0]}')">X</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                        </table>                 
                </div>
                <div style="float: right;">
                    <input id="account_name" type="text" maxlength="100" size="10">
                    <button class="btn btn-primary" onclick="post()">Add Account</button>
                </div>


            </div>
            <script> 

            //copy rows from backend to client js
            var rowsClient = ${JSON.stringify(rows)};

            //submit input boxes
            function submit(){
                var date = document.getElementById("date").value;
                var statements = [];
                var accounts = ${JSON.stringify(accounts)};
                for (account of accounts) {
                    var account_id = account.id;
                    var amount = document.getElementById(account.title.split(' ').join('_')).value;
                    statements.push({account_id, amount, date});
                }

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/CreateStatements", true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify({
                    date: date,
                    statements: statements
                }));
                xhr.onload = function() {
                    location.reload();
                }
            }   

            //function to delete row calling the api
            function deleteRow(date){
                var xhr = new XMLHttpRequest();
                xhr.open("DELETE", "/api/DeleteStatements", true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify({
                    date: date
                }));
                xhr.onload = function() {
                    location.reload();
                }
            }

            //function to delete account based on id
            function deleteAccount(id){
                var xhr = new XMLHttpRequest();
                xhr.open("DELETE", "/api/DeleteAccount", true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify({
                    account_id: id
                }));
                xhr.onload = function() {
                    location.reload();
                }
            }
            
            function post() {
                var account_title = document.getElementById("account_name").value;

                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/CreateAccount');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = function() {
                    console.log(xhr.responseText);
                };
                xhr.send(JSON.stringify({
                    account_title: account_title
                }));
                xhr.onload = function() {
                    location.reload();
                }
            }

            var timeFormat = 'YYYY-MM-DD';
            var config = {
                type:    'line',
                data:    {
                    datasets: [
                        {
                            data: [${xyValues.map(xyValue => `
                                {
                                    x: "${new Date(xyValue[0]).toISOString().substring(0, 10)}",
                                    y: ${xyValue[1]}
                                }
                            `).join(',')}],
                            lineTension: 0,
                            borderColor: '#007bff',
                            borderWidth: 4,
                            pointBackgroundColor: '#007bff'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    legend: {display:false},
                    scales:     {
                        xAxes: [{
                            type:       "time",
                            time:       {
                                format: timeFormat,
                                distribution: 'linear',
                                unit: 'month',
                                displayFormats: {
                                    quarter: 'MMM YYYY'
                                }
                            }
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display:     true,
                                labelString: 'value'
                            },
                            ticks: {
                                min: 0
                            }
                        }]
                    }
                }
            };

            function setDarkButton(minDate){
                document.getElementById('1Y').classList.remove('btn-dark');
                document.getElementById('6M').classList.remove('btn-dark');
                document.getElementById('all').classList.remove('btn-dark');
                document.getElementById('5Y').classList.remove('btn-dark');
                document.getElementById('1Y').classList.add('btn-light');
                document.getElementById('6M').classList.add('btn-light');
                document.getElementById('all').classList.add('btn-light');
                document.getElementById('5Y').classList.add('btn-light');
    
                switch(minDate){
                    case '5Y':
                        document.getElementById('5Y').classList.remove('btn-light');
                        document.getElementById('5Y').classList.add('btn-dark');
                        break;
                    case '6M':
                        document.getElementById('6M').classList.remove('btn-light');
                        document.getElementById('6M').classList.add('btn-dark');
                        break;
                    case '1Y':
                        document.getElementById('1Y').classList.remove('btn-light');
                        document.getElementById('1Y').classList.add('btn-dark');
                        break;
                    case 'all':
                        document.getElementById('all').classList.remove('btn-light');
                        document.getElementById('all').classList.add('btn-dark');
                        break;
                }
            }

            function changeXAxisMinDate(minDate){//minDate is a string, can be 6M, 1Y, 5Y, all
                //change the min date of the x axis chartjs
                if(!config || !config.options || !config.options.scales || !config.options.scales.xAxes){
                    return;
                }
                if(minDate === 'all'){
                    delete config.options.scales.xAxes[0].time.min;
                }
                else{
                    switch(minDate){
                        case '6M':
                            var date = new Date(rowsClient[0][0]);
                            var minDate2 = new Date(date.setMonth(date.getMonth() - 6));   
                            config.options.scales.xAxes[0].time.min = minDate2;
                            break;
                        case '1Y':
                            var date = new Date(rowsClient[0][0]);
                            var minDate2 = new Date(date.setMonth(date.getMonth() - 12));
                            config.options.scales.xAxes[0].time.min = minDate2;
                            break;
                        case '5Y':
                            var date = new Date(rowsClient[0][0]);
                            var minDate2 = new Date(date.setMonth(date.getMonth() - 60));
                            config.options.scales.xAxes[0].time.min = minDate2;
                            break;
                    }
                }
                setDarkButton(minDate);

                var ctx       = document.getElementById("canvas").getContext("2d");
                window.myLine = new Chart(ctx, config);
            }
        
            window.onload = function () {
                var ctx       = document.getElementById("canvas").getContext("2d");
                window.myLine = new Chart(ctx, config);
            };

            </script>

            </body>
        </html>
    `);
}

module.exports = renderHtml;