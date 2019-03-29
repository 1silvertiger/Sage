'use strict';

process.env.NODE_CONFIG_DIR = './config';

//node modules
const config = require('config'),
    babel = require('@babel/core'),

    ejs = require('ejs'),

    util = require('util'),

    express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    moment = require('moment'),
    plaid = require('plaid'),
    mariadb = require('mariadb'),

    webpack = require('webpack'),
    webpackDevMiddleware = require('webpack-dev-middleware'),

    fs = require('fs'),
    http = require('http'),
    https = require('https'),

    session = require('express-session'),

    exec = require('child_process').exec;

// model
const User = require('babel-loader!./src/model/user.js');
const UserDao = require('babel-loader!./src/model/userDao.js');
const Item = require('babel-loader!./src/model/item.js');
const ItemDao = require('babel-loader!./src/model/itemDao.js');
const Account = require('babel-loader!./src/model/account.js');
const AccountDao = require('babel-loader!./src/model/accountDao.js');
const Transaction = require('babel-loader!./src/model/transaction.js');
const TransactionDao = require('babel-loader!./src/model/transactionDao.js');
const Budget = require('babel-loader!./src/model/budget.js');
const BudgetDao = require('babel-loader!./src/model/budgetDao.js');

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

const userDao = new UserDao(pool);
const itemDao = new ItemDao(pool);
const accountDao = new AccountDao(pool);
const transactionDao = new TransactionDao(pool);
const budgetDao = new BudgetDao(pool);

const app = express();
const webpackConfig = require('./webpack.config.js');
const compiler = webpack(webpackConfig);

// Step 2: Attach the dev middleware to the compiler & the server
app.use(require("webpack-dev-middleware")(compiler, {
    logLevel: 'warn', publicPath: webpackConfig.output.publicPath
}));

// Step 3: Attach the hot middleware to the compiler & the server
app.use(require("webpack-hot-middleware")(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
}));

// app.use(webpackDevMiddleware(compiler, {
//     publicPath: webpackConfig.output.publicPath
// }));

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
    if (options) {
        console.log('SSL keys found.');
    } else
        console.log('Error accessing SSL keys');
    server = https.createServer(options, app).listen(APP_PORT);
    console.log('Server created.');
}

console.log('Express server listening on port ' + APP_PORT);

app.use(express.static('./src/public'));
app.set('views', './src/public/html/');
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
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
        } else {
            return res.redirect('/');
        }
    }
});

// Landing page
app.all('/', function (req, res, next) {
    //have a landing page here
    res.render('index.ejs', {
        URL: config.URL,
    });
});

app.all('/login', function (req, res) {
    res.render('login.ejs', {
        PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
        PLAID_ENV: PLAID_ENV,
        PLAID_PRODUCTS: PLAID_PRODUCTS,
        APP_MODE: config.APP_MODE,
        APP_PORT: config.APP_PORT,
        URL: config.URL,
        returnPath: req.session.returnPath || null,
    });
});

app.all('/logout', function (req, res) {
    req.session.user = null;
    res.sendStatus(200);
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
    res.render('budgets.ejs', {
        URL: config.URL
        , user: req.session.user
    });
});

app.all("/accounts", function (req, res) {
    let accounts = new Array();
    for (let i = 0; i < req.session.user.items.length; i++)
        accounts = accounts.concat(req.session.user.items[i].accounts);
    res.render('accounts.ejs', {
        URL: config.URL,
        accounts: accounts
    });
});

app.all('/old-accounts', function (req, res) {
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
                        URL: config.URL,
                        accounts: accounts
                    });
                } else {
                    console.log('no data');
                    res.end();
                }
            })
            .catch(err => {
                console.log(err);
                res.sendStatus('500');
            });
    }).catch(err => {
        console.log(err);
        res.sendStatus('500');
    });
});

app.all("/transactions", function (req, res) {
    res.render('transactions.ejs', {
        URL: config.URL
        , user: req.session.user
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
        const userId = payload['sub'];
        if (payload['aud'] == GOOGLE_AUTH_CLIENT_ID) {
            userDao.getById(userId).then(user => {
                if (user) {
                    console.log(user);
                    syncWithPlaid(user).then(syncedUser => {
                        req.session.test = "Hello, world!";
                        req.session.user = syncedUser;
                        res.sendStatus(200);
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    userDao.create(new User(userId, req.body.firstName, req.body.lastName, req.body.imageUrl, req.body.email)).then(user => {
                        req.session.test = "Hello, world!";
                        req.session.user = user;
                        res.sendStatus(200);
                    }).catch(err => {

                    });
                }
            }).catch(err => {
                res.sendStatus(500);
                console.log(err);
            });
        }
    }

    verify().catch(console.error);
});

app.all('/createBudget', function (req, res) {
    budgetDao.createOrUpdate(Budget.parseClientBudget(req.body.budget)).then(budget => {
        console.log('Budget:');
        console.log(budget);
        const temp = budget.toClientBudget(budget);
        res.json(JSON.stringify(temp));
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

//Plaid
app.all('/plaid-webhook', function (req, res, next) {
    console.log('PLAID WEBHOOK');
    console.log(JSON.stringify(req.body));
    const payload = JSON.parse(req.body);
    switch (payload.webhook_type) {
        case 'TRANSACTIONS':
            switch (payload.webhook_code) {
                case 'INITIAL_UPDATE':
                case 'DEFAULT_UPDATE':
                    console.log(payload);
                    break;
                case 'HISTORICAL_UPDATE':
                    break;
                case 'TRANSACTIONS_REMOVED':
                    break;
            }
            break;
        case 'ITEM':
            break;
    }
})

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

function syncWithPlaid(user) {
    return new Promise(function (resolve, reject) {
        let promises = new Array();
        for (let i = 0; i < user.items.length; i++) {
            promises.push(getAccounts(user.items[i].accessToken));
            promises.push(getTransactions(moment(user.items[i].lastSync).subtract(90, 'days').format('YYYY-MM-DD') || moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'), user.items[i].accessToken, 500, 0));
        }
        Promise.all(promises).then(values => {
            for (let i = 0; i < values.length; i++) {
                if (i % 2 === 0) {
                    user.items[Math.floor(i / 2)].accounts = values[i];
                } else {
                    user.items[Math.floor(i / 2)].transactions = values[i];
                    itemDao.updateLastSync(user.items[Math.floor(i / 2)]);
                }
            }
            resolve(user);
        }).catch(err => {
            console.log(err);
        });
    });
}

function getAccounts(accessToken) {
    return new Promise(function (resolve, reject) {
        client.getAccounts(accessToken, function (error, accountsResponse) {
            console.log('Plaid accounts:')
            prettyPrintResponse(accountsResponse);
            if (!error) {
                console.log('Account objects:');
                const accountsFromPlaid = new Array();
                for (let i = 0; i < accountsResponse.accounts.length; i++) {
                    //Convert JSON from Plaid to Account object
                    const tempAccount = new Account(accountsResponse.accounts[i].account_id
                        , accountsResponse.item.item_id
                        , accountsResponse.item.institution_id
                        , accountsResponse.accounts[i].balances.available
                        , accountsResponse.accounts[i].balances.current
                        , accountsResponse.accounts[i].name
                        , accountsResponse.accounts[i].official_name
                        , accountsResponse.accounts[i].type
                        , accountsResponse.accounts[i].subtype);
                    console.log(tempAccount);
                    accountsFromPlaid.push(tempAccount);
                }
                accountDao.batchCreateOrUpdate(accountsFromPlaid).then(updatedAccounts => {
                    console.log('Final result:');
                    console.log(updatedAccounts);
                    resolve(updatedAccounts);
                }).catch(err => {
                    Dao.handleQueryError(err);
                });
            }
            else {
                prettyPrintResponse(error);
                resolve(null);
            }
        });
    });
}

function getTransactions(startDate, endDate, accessToken, count, offset) {
    return new Promise(function (resolve, reject) {
        client.getTransactions(accessToken, startDate, endDate, {
            count: count,
            offset: offset,
        },
            function (error, transactionsResponse) {
                console.log('Plaid transactions:');
                prettyPrintResponse(transactionsResponse);
                if (!error) {
                    const newTransactions = new Array();
                    console.log('Transaction objects:');
                    for (let i = 0; i < transactionsResponse.transactions.length; i++) {
                        const tempTransaction = new Transaction(transactionsResponse.transactions[i].transaction_id
                            , transactionsResponse.item.item_id
                            , transactionsResponse.transactions[i].account_id
                            , transactionsResponse.transactions[i].amount
                            , transactionsResponse.transactions[i].name
                            , transactionsResponse.transactions[i].date);
                        console.log(tempTransaction);
                        newTransactions.push(tempTransaction);
                    }
                    transactionDao.batchCreate(newTransactions).then(newTransactionsFromDb => {
                        transactionDao.getAllByItemId(transactionsResponse.item.item_id).then(allTransactions => {
                            console.log('Transactions from DB:');
                            console.log(allTransactions);
                            resolve(allTransactions);
                        }).catch(err => {
                            console.log(err);
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    prettyPrintResponse(error);
                    resolve(null);
                }
            }
        );
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
