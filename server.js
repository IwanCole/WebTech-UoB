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

        // Signup requests
        if (req.type == "t_signup") {
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
        } 
        
        // Login Request
        else if (req.type == "t_login") {  
                 
        }
                 
        // Get profile requests
        else if (req.type == "t_profile") {
            
        }
        
        // Update profile request
        else if (req.type == "t_update") {
                 
        }
                 
        // Delete account request
        else if (req.type == "t_delete") {
            
        }
        
        else { return false; }
    } else { return false; }
    return true;
};


/* ---------------------------------------------

Validate that the data is of correct format
Check Name is only alpha chars, one word, < 35
Check Email is *@*.*, one word, < 254
Check Passwords > 8 alphanum, < 20
Check Passwords match
Check DogName alpha, one word, < 50

Return False if any conditions fail
Return True *only* if all conditions are met

---------------------------------------------- */
var validate_format = function(req) {
    var valid = true;
    var error = 0;
    
    if (!/^[a-zA-Z]+$/.test(req.name))   { error = 1; }
    if (req.name.length > 35)            { error = 2; }
    if (req.email.length > 254)          { error = 3; }
    // TODO Check email format *@*.*
    if ((req.email.indexOf("@") == -1 ) || (req.email.indexOf(".") == -1)) 
                                         { error = 4; }
    if (req.pass1.length < 8 || req.pass1.length > 20) 
                                         { error = 5; }
    if (req.pass1 !== req.pass2)         { error = 6; }
    if (!/^[a-zA-Z]+$/.test(req.dname))  { error = 7; }
    if (req.dname.length > 50)           { error = 8; }
    
    if (error != 0) { valid = false; }
    return { valid : valid, error : error };
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
    var status = 0;
    var payload = {success:false, cookie:"", info:""};
    
    if (validate_req(req.body)) {
        status = 200;
        var formatStatus = validate_format(req.body);
        
        if (formatStatus['valid']) {
            payload['success'] = true;
            payload['cookie']  = "hehehehehhe1233444";
            payload['info']    = "Signup Successful!";

        } else {
            var info = "";
            switch (formatStatus['error']) {
                case 1:
                    info = "Your name must contain letters only!";
                    break;
                case 2:
                    info = "Your name should be less than 35 characters!";
                    break;
                case 3:
                    info = "Your email address should be less thn 254 characters!";
                    break;
                case 4:
                    info = "Please enter a valid email address!";
                    break;
                case 5:
                    info = "Your password must be between 8 and 20 characters!";
                    break;
                case 6:
                    info = "Please ensure both passwords are the same!";
                    break;
                case 7:
                    info = "Your Dog's name must contain letters only!";
                    break;
                case 8:
                    info = "Your Dog's name must be less than 50 characters!";
                    break;
                default:
                    into = "Something's gone very wrong :(";
                    break;
            }
            payload['info'] = info;
        }
        
//        var name = req.name[0].toUpperCase() + req.name.slice(1);
    } else {
        status = 400;
        payload['info'] = "Bad request formatting >:(";
    }
    res.status(status)
    res.send(payload);
    
});



// Catch all other unsupported requests
var handle_bad_req = function(req) {
    var fullUrl = req.originalUrl;
    console.log("[SERVR] Bad Request: " + fullUrl);
};

app.get("*", function (req, res) {
    handle_bad_req(req);
    res.status(404);
    res.send("Content not found.");
});
app.post("*", function (req, res) {
    handle_bad_req(req);
    res.status(403);
    res.send("Not authorized to POST");
});
app.put("*", function (req, res) {
    handle_bad_req(req);
    res.status(403);
    res.send("Not authorized to PUT");
});
app.delete("*", function (req, res) {
    handle_bad_req(req);
    res.status(403);
    res.send("Not authorized to DELETE");
});