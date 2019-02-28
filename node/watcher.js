const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('../../../../../etc/letsencrypt/live/sage-savings.com/privkey.pem'),
    cert: fs.readFileSync('../../../../../etc/letsencrypt/live/sage-savings.com/fullchain.pem'),
}

https.createServer(options, function (req, res) {
    req.on('data', function (chunk) {
        console.log(req.body);
        exec('sh master-updated.sh');
    });

    res.end();
}).listen(3147);
