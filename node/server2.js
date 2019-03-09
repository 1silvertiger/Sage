'use strict';

process.env.NODE_CONFIG_DIR = './node/config';

const config = require('config'),

    ejs = require('ejs'),

    util = require('util'),

    express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    moment = require('moment'),
    plaid = require('plaid'),
    mariadb = require('mariadb'),

    fs = require('fs'),
    http = require('http'),
    https = require('https'),

    session = require('express-session'),

    exec = require('child_process').exec;

const GOOGLE_AUTH_CLIENT_ID = '426835960192-m5m68us80b86qg3ilpanmf91gm3ufqk4.apps.googleusercontent.com';

const { OAuth2Client } = require('google-auth-library');
const googleAuthClient = new OAuth2Client(GOOGLE_AUTH_CLIENT_ID);

const APP_PORT = config.APP_PORT;
const PLAID_CLIENT_ID = '5bf49265f581880011824d89';
const PLAID_SECRET = '0b6a7706cd492e6d13fa434511c50b';
const PLAID_PUBLIC_KEY = '207a2a1d9f7ca6de5a0f3a5c4f07e4';
const PLAID_ENV = 'sandbox';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
var PLAID_PRODUCTS = 'transactions';

// We store the access_token in memory - in production, store it in a secure
// persistent data store
var ACCESS_TOKEN = '';
var PUBLIC_TOKEN = null;
var ITEM_ID = '';

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
var client = new plaid.Client(
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_PUBLIC_KEY,
    plaid.environments[PLAID_ENV],
    { version: '2018-05-22' }
);

const pool = mariadb.createPool({
    host: 'sagesql.c8j75ssvguag.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'fVwPdEV8EE!P%9^84z^amwMDR*Nb4fV',
    database: 'SageSQL',
    port: 3306
});

const app = express();

app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

var server;

if (config.APP_MODE == "dev") {
    server = app.listen(APP_PORT);
} else if (config.APP_MODE == "beta" || config.APP_MODE == "prod") {
    var options = {
        key: fs.readFileSync('../../../../../etc/letsencrypt/live/sage-savings.com/privkey.pem'),
        cert: fs.readFileSync('../../../../../etc/letsencrypt/live/sage-savings.com/fullchain.pem'),
    };
    server = https.createServer(options, app).listen(APP_PORT);
}

console.log('Express server listening on port ' + APP_PORT);

app.use(express.static('./src/public'));
app.set('views', './src/public/html/');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

var corsOptions = {
    origin: config.URL,
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", config.URL);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

const global = {
    //Fill with global vars that are sent in every response
}

//\\//\\//\\//\\NAVIGATION//\\//\\//\\//\\

//Authenticate
app.use(function (req, res, next) {
    if (req.session.user || req.path === '/login' || req.path === '/tokensignin')
        next();
    else {
        if (req.path) {
            req.session.returnPath = req.path;
            return res.redirect('/login');
        }
    }
});

// Landing page
app.all('/', function (req, res, next) {
    //have a landing page here
    // if (req.session.user) {
    //     return res.redirect('/home');
    // } else {
    // res.render('login.ejs', {
    //     PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
    //     PLAID_ENV: PLAID_ENV,
    //     PLAID_PRODUCTS: PLAID_PRODUCTS,
    //     APP_MODE: config.APP_MODE,
    //     APP_PORT: config.APP_PORT,
    //     URL: config.URL,
    // });
    // }
});

app.all('/login', function (req, res) {
    res.render('login.ejs', {
        PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
        PLAID_ENV: PLAID_ENV,
        PLAID_PRODUCTS: PLAID_PRODUCTS,
        APP_MODE: config.APP_MODE,
        APP_PORT: config.APP_PORT,
        URL: config.URL,
        returnPath: req.session.returnPath || "",
    });
});

app.all('/home', function (req, res) {
    return res.render('home.ejs', {
        PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
        PLAID_ENV: PLAID_ENV,
        PLAID_PRODUCTS: PLAID_PRODUCTS,
        APP_MODE: config.APP_MODE,
        APP_PORT: config.APP_PORT,
        URL: config.URL,
        test: req.session.test,
        user: req.session.user,
        debug: 'try it again'
    });
});

app.all("/budgets", function (req, res) {
    pool.getConnection()
        .then(conn => {
            conn.query()
                .then(rows => {

                })
                .catch(err => {

                });
        })
        .catch(err => {

        });
});

app.all("/accounts", function (req, res) {
    pool.getConnection().then(conn => {
        conn.query('CALL getAllPlaidItemsByUserId(?)', [req.session.user.id])
            .then(async rows => {
                if (rows[0].length > 0) {
                    let accounts = new Array();
                    for (let i = 0; i < rows[0].length; i++) {
                        await getAccounts(rows[0][i].accessToken).then(item => {
                            accounts = accounts.concat(item.accounts);
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                    res.render('accounts.ejs', {
                        accounts: accounts
                    });
                } else {
                    console.log('no data');
                    res.end();
                }
            })
            .catch(err => {
                console.log(err);
            });
    }).catch(err => {
        console.log(err);
    });
});

app.all("/transactions", function (req, res) {
    pool.getConnection().then(conn => {
        conn.query('CALL getAllPlaidItemsByUserId(?)', [req.session.user.id])
            .then(rows => {
                let accounts = new Array();
                //let transactions = new Array();
                for (let i = 0; i < rows[0].length; i++) {
                    getTransactionsPromise(moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'), rows[0][i].accessToken, 5, 0).then(transactions => {
                        // accounts.push(transactions.);
                        prettyPrintResponse(transactions);
                        res.render('transactions.ejs', {
                            transactions: transactions.transactions,
                            user: req.session.user,
                            URL: config.URL
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                }
            })
            .catch(err => {
                console.log(err)
                res.sendStatus(500);
            });
    });
});

//\\//\\//\\//\\API//\\//\\//\\//\\
// Sign in
app.post('/tokensignin', function (req, res) {
    async function verify() {
        const ticket = await googleAuthClient.verifyIdToken({
            idToken: req.body.idtoken,
            audience: GOOGLE_AUTH_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        if (payload['aud'] == GOOGLE_AUTH_CLIENT_ID) {
            pool.getConnection().then(conn => {
                conn.query("CALL getUserByGoogleId(?)", [userid])
                    .then(rows => {
                        if (rows[0].length > 0) {
                            req.session.test = "Hello, world!";
                            req.session.user = {
                                id: rows[0][0].googleId,
                                'firstName': rows[0][0].firstName,
                                'lastName': rows[0][0].lastName,
                                'avatar': rows[0][0].imageUrl
                            };
                        } else {
                            conn.query("CALL createUser(?,?,?,?,?)) VALUES (?,?,?,?,?)"
                                , [userid, req.body.firstName, req.body.lastName, req.body.imageUrl, req.body.email]
                            )
                                .then(rows => {
                                    req.session.user = {
                                        id: rows[0][0].googleId,
                                        firstName: rows[0].firstName,
                                        lastName: rows[0].lastName,
                                        avatar: rows[0].imageUrl,
                                    };
                                })
                                .catch(err => {
                                    console.log("error: " + err);
                                    res.sendStatus(500);
                                });
                        }
                        res.sendStatus(200);
                        conn.end();
                    })
                    .catch(err => {
                        res.send(err);
                    });
            });
        }
    }

    verify().catch(console.error);
});

//Plaid

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post('/get_access_token', function (req, res, next) {
    client.exchangePublicToken(req.body.public_token, function (error, tokenResponse) {
        if (error != null) {
            prettyPrintResponse(error);
            return res.json({
                error: error,
            });
        }
        //Save to DB
        pool.getConnection().then(conn => {
            conn.query('CALL createPlaidItem(?,?,?)', [req.session.user.id, tokenResponse.item_id, tokenResponse.access_token])
                .catch(err => {
                    console.log(err);
                });
        });
        prettyPrintResponse(tokenResponse);
        res.json({
            access_token: tokenResponse.access_token,
            item_id: tokenResponse.item_id,
            error: null,
        });
    });
});


// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get('/get-transactions', function (request, response, next) {
    // Pull transactions for the Item for the last 30 days
    var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    var endDate = moment().format('YYYY-MM-DD');
    client.getTransactions('access-sandbox-2efb1838-a358-403f-a806-dbac32d4ff84', startDate, endDate, {
        count: 250,
        offset: 0,
    }, function (error, transactionsResponse) {
        if (error != null) {
            prettyPrintResponse(error);
            return response.json({
                error: error
            });
        } else {
            response.json({ error: null, transactions: transactionsResponse });
        }
    });
});

//Retrieve Transactions for an Item
// function getTransactions(startDate, endDate, accessToken, count, offset) {
//     console.log('debug');
//     client.getTransactions(accessToken, startDate, endDate, {
//         count: count, 
//         offset: offset,},
//         function (error, transactionsResponse) {
//             console.log('transactionsResponse: ');
//             // prettyPrintResponse(transactionsResponse);
//             if (error == null ) {
//                 return transactionsResponse;
//             } else {
//                 return error;
//             }
//         }
//     );
// }



// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
app.get('/identity', function (request, response, next) {
    client.getIdentity(ACCESS_TOKEN, function (error, identityResponse) {
        if (error != null) {
            prettyPrintResponse(error);
            return response.json({
                error: error,
            });
        }
        prettyPrintResponse(identityResponse);
        response.json({ error: null, identity: identityResponse });
    });
});

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
app.get('/balance', function (request, response, next) {
    client.getBalance(ACCESS_TOKEN, function (error, balanceResponse) {
        if (error != null) {
            prettyPrintResponse(error);
            return response.json({
                error: error,
            });
        }
        prettyPrintResponse(balanceResponse);
        response.json({ error: null, balance: balanceResponse });
    });
});

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
app.get('/accounts', function (request, response, next) {
    client.getAccounts(ACCESS_TOKEN, function (error, accountsResponse) {
        if (error != null) {
            prettyPrintResponse(error);
            return response.json({
                error: error,
            });
        }
        prettyPrintResponse(accountsResponse);
        response.json({ error: null, accounts: accountsResponse });
    });
});

function getTransactionsPromise(startDate, endDate, accessToken, count, offset) {
    return new Promise(function (resolve, reject) {
        client.getTransactions(accessToken, startDate, endDate, {
            count: count,
            offset: offset,
        },
            function (error, transactionsResponse) {
                resolve(transactionsResponse);
            }
        );
    });
}

function getAccounts(accessToken) {
    return new Promise(function (resolve, reject) {
        client.getAccounts(accessToken, function (error, accountsResponse) {
            if (error != null) {
                prettyPrintResponse(error);
            }
            prettyPrintResponse(accountsResponse);
            resolve(accountsResponse);
        });
    });
}

function getAllAccounts(accessTokens) {
    return new Promise(function (resolce, reject) {

    });
}

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
app.get('/auth', function (request, response, next) {
    client.getAuth(ACCESS_TOKEN, function (error, authResponse) {
        if (error != null) {
            prettyPrintResponse(error);
            return response.json({
                error: error,
            });
        }
        prettyPrintResponse(authResponse);
        response.json({ error: null, auth: authResponse });
    });
});

// Create and then retrieve an Asset Report for one or more Items. Note that an
// Asset Report can contain up to 100 items, but for simplicity we're only
// including one Item here.
// https://plaid.com/docs/#assets
app.get('/assets', function (request, response, next) {
    // You can specify up to two years of transaction history for an Asset
    // Report.
    var daysRequested = 10;

    // The `options` object allows you to specify a webhook for Asset Report
    // generation, as well as information that you want included in the Asset
    // Report. All fields are optional.
    var options = {
        client_report_id: 'Custom Report ID #123',
        // webhook: 'https://your-domain.tld/plaid-webhook',
        user: {
            client_user_id: 'Custom User ID #456',
            first_name: 'Alice',
            middle_name: 'Bobcat',
            last_name: 'Cranberry',
            ssn: '123-45-6789',
            phone_number: '555-123-4567',
            email: 'alice@example.com',
        },
    };
    client.createAssetReport(
        [ACCESS_TOKEN],
        daysRequested,
        options,
        function (error, assetReportCreateResponse) {
            if (error != null) {
                prettyPrintResponse(error);
                return response.json({
                    error: error,
                });
            }
            prettyPrintResponse(assetReportCreateResponse);

            var assetReportToken = assetReportCreateResponse.asset_report_token;
            respondWithAssetReport(20, assetReportToken, client, response);
        },
    );
});

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
app.get('/item', function (request, response, next) {
    // Pull the Item - this includes information about available products,
    // billed products, webhook information, and more.
    client.getItem(ACCESS_TOKEN, function (error, itemResponse) {
        if (error != null) {
            prettyPrintResponse(error);
            return response.json({
                error: error
            });
        }
        // Also pull information about the institution
        client.getInstitutionById(itemResponse.item.institution_id, function (err, instRes) {
            if (err != null) {
                var msg = 'Unable to pull institution information from the Plaid API.';
                console.log(msg + '\n' + JSON.stringify(error));
                return response.json({
                    error: msg
                });
            } else {
                prettyPrintResponse(itemResponse);
                response.json({
                    item: itemResponse.item,
                    institution: instRes.institution,
                });
            }
        });
    });
});

var prettyPrintResponse = response => {
    console.log(util.inspect(response, { colors: true, depth: 4 }));
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.
var respondWithAssetReport = (
    numRetriesRemaining,
    assetReportToken,
    client,
    response,
) => {
    if (numRetriesRemaining == 0) {
        return response.json({
            error: 'Timed out when polling for Asset Report',
        });
    }

    client.getAssetReport(
        assetReportToken,
        function (error, assetReportGetResponse) {
            if (error != null) {
                prettyPrintResponse(error);
                if (error.error_code == 'PRODUCT_NOT_READY') {
                    setTimeout(
                        () => respondWithAssetReport(
                            --numRetriesRemaining, assetReportToken, client, response),
                        1000,
                    );
                    return
                }

                return response.json({
                    error: error,
                });
            }

            client.getAssetReportPdf(
                assetReportToken,
                function (error, assetReportGetPdfResponse) {
                    if (error != null) {
                        return response.json({
                            error: error,
                        });
                    }

                    response.json({
                        error: null,
                        json: assetReportGetResponse.report,
                        pdf: assetReportGetPdfResponse.buffer.toString('base64'),
                    })
                },
            );
        },
    );
};

app.post('/set_access_token', function (request, response, next) {
    ACCESS_TOKEN = request.body.access_token;
    client.getItem(ACCESS_TOKEN, function (error, itemResponse) {
        response.json({
            item_id: itemResponse.item.item_id,
            error: false,
        });
    });
});
