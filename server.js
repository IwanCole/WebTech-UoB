// Required imported modules and libs
var path  = require('path');
var WSS = require('ws').Server;
var express = require('express');
var bodyParser = require('body-parser');


// Start the Express server
var app = express();
var staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));




// Webserver listens on port 8080, serves the webpages
app.listen(8080, function() {
    console.log('Express HTTP server on listening on port 8080');
});

// Listens for the index page request
app.get("/", function(req, res) {
    res.sendFile("/public/");
});
