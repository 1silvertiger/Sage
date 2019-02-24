'use strict';

var config = require('config'),

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

    session = require('express-session');

var GOOGLE_AUTH_CLIENT_ID = '426835960192-m5m68us80b86qg3ilpanmf91gm3ufqk4.apps.googleusercontent.com';

const { OAuth2Client } = require('google-auth-library');
const googleAuthClient = new OAuth2Client(GOOGLE_AUTH_CLIENT_ID);

var APP_PORT = config.APP_PORT;
var PLAID_CLIENT_ID = '5bf49265f581880011824d89';
var PLAID_SECRET = '0b6a7706cd492e6d13fa434511c50b';
var PLAID_PUBLIC_KEY = '207a2a1d9f7ca6de5a0f3a5c4f07e4';
var PLAID_ENV = 'sandbox';

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

var app = express();

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

app.use(express.static('../src/public'));
app.set('views', '../src/public/html/');
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

//\\//\\//\\//\\AUTHENTICATE//\\//\\//\\//\\
app.all('*', function (req, res, next) {
    //TODO: authenticate
    next();
});

//\\//\\//\\//\\NAVIGATION//\\//\\//\\//\\
// Landing page
app.get('/', function (request, response, next) {
    response.render('index.ejs', {
        PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
        PLAID_ENV: PLAID_ENV,
        PLAID_PRODUCTS: PLAID_PRODUCTS,
        APP_MODE: config.APP_MODE,
        APP_PORT: config.APP_PORT,
        URL: config.URL,
    });
});

app.all('/home', function (req, res) {
    console.log("req.session.test = " + req.session.test);
    console.log(req.session);
    return res.render('home.ejs', {
        PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
        PLAID_ENV: PLAID_ENV,
        PLAID_PRODUCTS: PLAID_PRODUCTS,
        APP_MODE: config.APP_MODE,
        APP_PORT: config.APP_PORT,
        URL: config.URL,
        test: req.session.test,
        user: req.session.user,
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
                        if (rows[0]) {
                            req.session.test = "Hello, world!";
                            console.log("req.session.test = " + req.session.test);
                            req.session.user = {
                                firstName: rows[0].firstName,
                                lastName: rows[0].lastName,
                                avatar: rows[0].imageUrl,
                            };
                            console.log("user: " + req.session.user);
                        } else {
                            conn
                                .query("CALL createUser(?,?,?,?,?)) VALUES (?,?,?,?,?)"
                                    , [userid, req.body.firstName, req.body.lastName, req.body.imageUrl, req.body.email]
                                )
                                .then(rows => {
                                    req.session.user = {
                                        firstName: rows[0].firstName,
                                        lastName: rows[0].lastName,
                                        avatar: rows[0].imageUrl,
                                    };
                                })
                                .catch(err => {
                                    console.log("error: " + err);
                                    res.send(err);
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

app.all("/plaid", function (req, res) {
    console.log(PLAID_ENV);
    return res.render('plaid.ejs', {
        PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
        PLAID_ENV: PLAID_ENV,
        PLAID_PRODUCTS: PLAID_PRODUCTS,
        APP_MODE: config.APP_MODE,
        APP_PORT: config.APP_PORT,
        URL: config.URL,
    });
});

//Plaid

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post('/get_access_token', function (request, response, next) {
    PUBLIC_TOKEN = request.body.public_token;
    client.exchangePublicToken(PUBLIC_TOKEN, function (error, tokenResponse) {
        if (error != null) {
            prettyPrintResponse(error);
            return response.json({
                error: error,
            });
        }
        ACCESS_TOKEN = tokenResponse.access_token;
        ITEM_ID = tokenResponse.item_id;
        prettyPrintResponse(tokenResponse);
        response.json({
            access_token: ACCESS_TOKEN,
            item_id: ITEM_ID,
            error: null,
        });
    });
});


// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get('/transactions', function (request, response, next) {
    // Pull transactions for the Item for the last 30 days
    var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    var endDate = moment().format('YYYY-MM-DD');
    client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
        count: 250,
        offset: 0,
    }, function (error, transactionsResponse) {
        if (error != null) {
            prettyPrintResponse(error);
            return response.json({
                error: error
            });
        } else {
            prettyPrintResponse(transactionsResponse);
            response.json({ error: null, transactions: transactionsResponse });
        }
    });
});

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