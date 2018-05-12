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


/* ---------------------------------------------

Validate the data is ready to be operated on
Check that the request has a "type" field
For each possible "type" of req, check:
    Exact number of key-value pairs are present
    Existence of pair & Correct order of pairs
    Non-empty string as value for pair

Return False if any conditions fail
Return True *only* if all conditions are met

---------------------------------------------- */
var validate_req = function(req) {
    if (typeof req != "object") { return false; }
    
    if (req.type != undefined) {
        if (req.type == "signup") {
            if (Object.keys(req).length == 6) {
                var expected = ["type", "name", "email", "pass1", "pass2", "dname"];
                var i = 0;
                var actual = Object.keys(req);
                while (i < 6) {
                    if (expected[i] != actual[i]) { return false; }
                    if (req[expected[i]] == "") { return false; }
                    i++;
                }
            } else { return false; }
        } else { return false; }
    } else { return false; }
    
    return true;
};




// Webserver listens on port 8080, serves the webpages
app.listen(8080, function() {
    console.log('Express HTTP server on listening on port 8080');
});

// Listens for the index page request
app.get("/", function(req, res) {
    res.sendFile("/public/");
});

app.post("/API-signup", function(req, res) {
    console.log(req.body);
    
    if (validate_req(req.body)) {
        res.status(200);
        res.send("This is GOOD :D");
    } else {
        res.status(400)
        res.send("This is BAD >:(");
    }
    
});
