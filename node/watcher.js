const https = require('https');

https.createServer(function (req, res) {
    req.on('data', function (chunk) {
        console.log(req.body);
        exec('sh master-updated.sh');
    });

    res.end();
}).listen(3147);
