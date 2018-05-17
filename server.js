// Required imported modules and libs
var fs = require("fs");
var path  = require('path');
var sql = require("sqlite3");
var bcrypt = require("bcrypt");
var WSS = require('ws').Server;
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");


// Start the Express server, create DB
var db = new sql.Database("data.db");
var app = express();
var staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));
app.use(cookieParser());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var main_chat_wss = new WSS({ port: 8081 });

var globalEmails    = {};
var globalIDs       = {};
var globalSessions  = {};


/* =============================================

            Database functions

============================================== */
var db_init = function() {
    db.run("CREATE TABLE IF NOT EXISTS users (uid, id, email, name, dname, picloc, salt, passhash, token)");
};


/* ---------------------------------------------

Create a new entry for new user in USERS table

---------------------------------------------- */
var db_new_user = function(UID, ID, email, name, dname, picloc, salt, passHash, token) {
    db.run("INSERT INTO users (uid, id, email, name, dname, picloc, salt, passhash, token) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)", [UID, ID, email, name, dname, picloc, salt, passHash, token], function (err) {
        if (err != null) {
            console.log(err);
        }
    });
};


/* ---------------------------------------------

Get all registered emails from USERS table

---------------------------------------------- */
var db_get_emails_ids = function () {
    db.all("SELECT email as email, id as id FROM users", function (err, row) {
        if (err == null) {
            var i = 0;
            while (i < row.length) {
                globalEmails[row[i]['email'].toLowerCase()] = 1;
                globalIDs[row[i]['id']] = 1;
                i++;
            }
        }
    });
}


/* ---------------------------------------------

Called when someone visits /me
Takes the cookie provided in the request header
and attempts to match it to a user ID. When a user
is logged in, going to /me should redirect them
to THEIR user page, else return to home (/).

---------------------------------------------- */
var db_cookie_to_ID = function (UID, token, res) {
    db.all("SELECT uid as UID, id as id, token as token FROM users WHERE uid=? AND token=?", [UID, token], function (err, rows) {
        if (err == null) {
            if (rows.length > 0) {
                    res.redirect(303, "/profile?id=" + rows[0]['id']);
            }
            else {
                clear_loginAuth_cookie(res);
                res.redirect(303, "/");
            }
        } else {
            console.log(err);
            res.redirect(303, "/");
        }
    });
}


var db_attempt_auth = function (email, password, res) {
    db.all("SELECT uid as UID, id as id, email as email, name as name, salt as salt, passHash as passHash, token as token FROM users WHERE email=?", [email], function (err, rows) {
        status = 0;
        payload = {success:false, cookie:"", info:""};
        if (err == null) {
            if (rows.length > 0) {
                var item = rows[0];
                var passHashAttempt = create_hash(password, item['salt']);
                if (passHashAttempt['hash'] == item['passHash']) {

                    var cookie = create_login_cookie(item['UID'], item['token']);
                    status = 200;
                    payload["success"] = true;
                    payload["cookie"]  = cookie;
                    payload["info"]    = "Login successful, redirecting...";
                    res.cookie("loginAuth", cookie,
                              { expires: new Date(Date.now() + 90000000000),
                                encode: String});
                    var session = create_session_token(item['name'], item['id']);
                    res.cookie("myID", item['id'], 
                               { expires: new Date(Date.now() + 90000000000),
                                encode: String});
                    res.cookie("session", session,
                              { expires: 0,
                                encode: String});
                                

                } else {
                    // password incorrect??
                    payload["info"] = "Email address or password is incorrect. Please try again.";
                    status = 200;
                }
            } else {
                // Email provided not registered
                payload["info"] = "Email address or password is incorrect. Please try again.";
                status = 200;
            }
        } else {
            console.log(err);
            payload["info"] = "Something went wrong. Please try again.";
            status = 400;
        }
        res.status(status);
        // This is purposefully slowing down the server response time, NEEDS to
        // be removed as the site scales up. This is done currently to show off
        // the nice animation effect on the client side.
        setTimeout(function () {
            res.send(payload);
        }, 1000);
    });
}

//var db_loginAuth_cookie_check = function (req, res) {
////    console.log("OOO : " + cookie);
//    db.all("SELECT uid as UID, id as id, name as name, token as token FROM users", function (err, rows) {
//        var cookie_UID = req.cookies['loginAuth'].split("|")[0];
//        var cookie_tok = req.cookies['loginAuth'].split("|")[1];
//        
//        var i = 0;
//        var found = false;
//        var foundAccount = {};
//
//        while (i < rows.length) {
//            var item = rows[i];
//            if (item['uid'] == cookie_UID && item['token'] == cookie_tok) {
//                found = true;
//                foundAccount = item;
//                break;
//            }
//            i++;
//        }
//        if (found) {
//            var cookie = create_login_cookie(item['UID'], item['token']);
//            res.cookie("loginAuth", cookie,
//                      { expires: new Date(Date.now() + 90000000000),
//                        encode: String});
//            var session = create_session_token(item['name'], item['id']);
//            res.cookie("session", session,
//                      { expires: 0,
//                        encode: String});
//            res.send({success: true});
//        } else {
//            res.status(403);
//            res.send();
//        }
//
//                
//        
//        
//        
//    });
//    
//    
//};


/* ---------------------------------------------

Start the web server, init the database

---------------------------------------------- */
app.listen(8080, function() {
    console.log('Express HTTP server on listening on port 8080');
    db.serialize(db_init);
    db_get_emails_ids();
});

//setInterval(function() {
//    console.log(globalEmails);
//    console.log(globalIDs);
//    console.log(globalSessions);
//}, 12000);



/* =============================================

                Helper functions

============================================== */
/* ---------------------------------------------

Replace all targets in string (SO)

---------------------------------------------- */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


/* ---------------------------------------------

Pad an int with leading zero's for a given len

---------------------------------------------- */
var misc_pad_zeros = function (num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}


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
            if (Object.keys(req).length == 3) {
                var expected = ["type", "email", "pass1"];
                var i = 0;
                var actual = Object.keys(req);
                while (i < 6) {
                    if (expected[i] != actual[i]) { return false; }
                    if (req[expected[i]] == "") { return false; }
                    i++;
                }
            } else { return false; }
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

    return error;
};


/* ---------------------------------------------

Check if email is associated with existing account
Return True or False depending on this

---------------------------------------------- */
var validate_email_exists = function (email) {
    var exists = false;
    if (globalEmails[email] != undefined) {
        exists = true;
    }
    return exists;
}


/* ---------------------------------------------

Gen (Blowfish based) hash from plaintext and Salt

---------------------------------------------- */
var create_hash = function(plaintext, salt) {
    var hash = bcrypt.hashSync(plaintext, salt);
    return {
        salt:salt,
        hash:hash
    };
};


/* ---------------------------------------------

Create login token for user

---------------------------------------------- */
var create_auth_token = function (salt, passHash) {
    var date = new Date();
    var time = date.getTime().toString();
    var token = create_hash(passHash + time, salt)
    return token['hash'];
}

var create_session_token = function (name, id) {
    var token = misc_pad_zeros(Math.floor(Math.random() * 1000000000) + 1, 11);
    while (globalSessions[token] != undefined) {
        token = misc_pad_zeros(Math.floor(Math.random() * 1000000000) + 1, 11);
    }
    globalSessions[token] = [id, name];
    return token;
}

/* ---------------------------------------------

Calculate values related to creating a new user
Create random Salt
Create UID      = hash(salt+email)
Create PassHash = hash(salt+password)

---------------------------------------------- */
var create_user_creds = function(email, password, name) {
    var salt         = bcrypt.genSaltSync(10);
    var passwordData = create_hash(password, salt);
    var UIDData      = create_hash(email, salt);
    var token        = create_auth_token(salt, passwordData['hash']);
    var ID           = misc_pad_zeros(Math.floor(Math.random() * 10000000) + 1, 9);

    while (globalIDs[ID] != undefined) {
        ID = misc_pad_zeros(Math.floor(Math.random() * 10000000) + 1, 9);
    }
    var session      = create_session_token(name, ID);
    
    globalIDs[ID] = 1;

    console.log("Salt: " + salt);
    console.log("PassHash: " + passwordData['hash']);
    console.log("UID: " + UIDData['hash']);
    console.log("Token: " + token);
    console.log("ID: " + ID);
    return {
        salt: salt,
        passHash: passwordData['hash'],
        UID: UIDData['hash'],
        ID: ID,
        token: token,
        session: session
    };
};


/* ---------------------------------------------

Create the loginAuth cookie to give to client

---------------------------------------------- */
var create_login_cookie = function (UID, token) {
    return  UID + "|" + token;
}


/* ---------------------------------------------

Create a new user account from start to finish:
    Check if email is already registered
    Generate hashed credentials for cookies / DB
    Insert new record into DB
    Return cookies to user if successful
    Return appropriate error otherwise

---------------------------------------------- */
var create_new_user = function (req) {
    // Also return redirect
    if (!validate_email_exists(req.email.toLowerCase())) {
        globalEmails[req.email.toLowerCase()] = 1;
        var name  = req.name[0].toUpperCase() + req.name.slice(1);
        var userCredentials = create_user_creds(req.email, req.pass1, name);
        var dname = req.dname[0].toUpperCase() + req.dname.slice(1);
        db_new_user(userCredentials['UID'],
                    userCredentials['ID'],
                    req.email.toLowerCase(),
                    name,
                    dname,
                    "EOF",
                    userCredentials['salt'],
                    userCredentials['passHash'],
                    userCredentials['token']);

        return {
            success: true,
            cookie: create_login_cookie(userCredentials['UID'], userCredentials['token']),
            session: userCredentials['session'],
            myID: userCredentials['ID'],
            info: "Signup successful. Logging in...",
        };
    } else {
        return {
            success: false,
            cookie: "",
            session: "",
            myID: "",
            info: "Email entered already associated to existing account. Please login or contact the admins if you require assistance.",
        };
    }
};


/* ---------------------------------------------

Clear a loginAuth cookie from the client

---------------------------------------------- */
var clear_loginAuth_cookie = function (res) {
    res.clearCookie("session", "");
    res.clearCookie("myID", "");
    res.clearCookie("theme", "");
    res.clearCookie("loginAuth", "");
    return res;
}


/* =============================================

                Routing functions

============================================== */
/* ---------------------------------------------

Default route when reaching the home index

---------------------------------------------- */
app.get("/", function(req, res) {
    res.sendFile("/public/");
});


/* ---------------------------------------------

Redirect any logged-in user to their profile

---------------------------------------------- */
app.get("/me", function (req, res) {
    if (req.cookies['loginAuth'] != undefined) {
        var cookie = req.cookies['loginAuth'];
        if (cookie.length == 121) {
            if (cookie.indexOf("|") == 60) {
                var UID = cookie.split("|")[0];
                var token = cookie.split("|")[1];
                db_cookie_to_ID(UID, token, res);
            } else {
//                res.cookie("login")
                clear_loginAuth_cookie(res);
                res.redirect(303, "/"); 
            }
        } else {
            clear_loginAuth_cookie(res);
            res.redirect(303, "/"); 
        }
    } else {
        clear_loginAuth_cookie(res);
        res.redirect(303, "/"); 
    }
});


/* ---------------------------------------------

Load a user profile page, with the query ?id
Not currently implemented properly

---------------------------------------------- */
app.get("/profile", function (req, res) {
    if (req.query.id != undefined) {
        if (req.query.id != "") {
            if (globalIDs[req.query.id] != undefined) {
                console.log("This is a valid request");
                res.send("Landed!");                
            } else { res.redirect(303, "/404"); }
        } else { res.redirect(303, "/404"); }
    } else { res.redirect(303, "/404"); }
});


app.get("/dashboard", function (req, res) {
    if (req.cookies['session'] != undefined) {
        if (globalSessions[req.cookies['session']] != undefined) {
            fs.readFile(__dirname + '/templates/dashboard.html', 'utf8', function (err, dashboard) {
                if (err == null) {
                    var profile = globalSessions[req.cookies['session']][0];
                    var name    = globalSessions[req.cookies['session']][1];
                    fs.readFile(__dirname + '/templates/nav.html', 'utf8', function (err, nav) {
                        if (err == null) {
                            dashboard = dashboard.replace("%%nav%%", nav);
                            dashboard = dashboard.replaceAll("%%name%%", name);
                            res.status(200);
                            res.send(dashboard);
                        } else {
                            res.status(500);
                            res.send("Something went wrong...");
                            console.log(err);
                        }
                    });
                } else {
                    res.status(500);
                    res.send("Something went wrong...");
                    console.log(err);
                }
            });
        } else { res.redirect(303, "/"); }
    } else { res.redirect(303, "/"); }
});



app.get("/API-logout", function (req, res) {
    res = clear_loginAuth_cookie(res);
    res.redirect(303, "/");
});


/* ---------------------------------------------

Handle requests to the Login API
Runs all the user authenticating logic

---------------------------------------------- */
app.post("/API-login", function(req, res) {
    console.log(req.body);
    var status = 0;
    var payload = {success:false, cookie:"", info:""};

    /* Validate structre, types & existence of incoming request */
    if (validate_req(req.body)) {
        db_attempt_auth(req.body.email.toLowerCase(), req.body.pass1, res);
    } else {
        res.status(400);
        payload['info'] = "Bad request formatting >:(";
        res.send(payload);
    }
});


//app.post("/API-login-cookie", function (req, res) {
//    // Check if persitent login cookie is present
//    if (req.cookies['loginAuth'] != undefined) {
//        db_loginAuth_cookie_check(req, res);
//    } else {
//        res.status(403);
//        res.send();
//    }
//});


/* ---------------------------------------------

Handle requests to the Signup API
No html page here, used by POST requests to send
data from the signup form. Validate all data
before processing, send appropriate response.

---------------------------------------------- */
app.post("/API-signup", function(req, res) {
    console.log(req.body);
    var status = 0;
    var payload = {success:false, cookie:"", session: "", myID: "", info:""};

    /* Validate structre, types & existence of incoming request */
    if (validate_req(req.body)) {
        status = 200;
        var formatStatus = validate_format(req.body);

        if (formatStatus == 0) {
            payload = create_new_user(req.body);

        } else {
            var info = "";
            switch (formatStatus) {
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

    } else {
        status = 400;
        payload['info'] = "Bad request formatting >:(";
    }
    res.status(status)
    res.cookie("loginAuth", payload['cookie'],
               { expires: new Date(Date.now() + 90000000000),
                 encode: String});
    res.cookie("myID", payload['myID'], 
               { expires: new Date(Date.now() + 90000000000),
                 encode: String});
    res.cookie("session", payload['session'],
               { expires: 0,
                 encode: String});

    // This is purposefully slowing down the server response time, NEEDS to
    // be removed as the site scales up. This is done currently to show off
    // the nice animation effect on the client side.
    setTimeout(function () {
        res.send(payload);
    }, 1500);

});


/* ---------------------------------------------

Catch all other unsupported requests

---------------------------------------------- */
var handle_bad_req = function(req) {
    var fullUrl = req.originalUrl;
    console.log("[SERVR] Bad Request: " + fullUrl);
};

app.get("*", function (req, res) {
    handle_bad_req(req);
    res.status(404);
    res.sendFile(path.join(__dirname, "/public/404.html"));
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


/* =============================================

              Websocket functions

============================================== */
/* ---------------------------------------------

Handling the main chat websocket connection

---------------------------------------------- */


main_chat_wss.on("connection", function connection (socket) {
    socket.on("message", function incoming(data) {
        try {
            var message = JSON.parse(data);
            if (message.session != undefined && message.data != undefined){
                var data    = message.data;
                var session = message.session;
                
                if (data.replaceAll(" ", "") != "") {
                    if (globalSessions[session] != undefined) {
                        var ID   = globalSessions[session][0];
                        var name = globalSessions[session][1];
                        
                        console.log(name + ": " + data); 
                        
                        var payload = JSON.stringify({
                            senderName: name,
                            senderID: ID,
                            message: data
                        });
                        // send to all !!!!!!!
                        
                        main_chat_wss.clients.forEach(function each(client) {
                            client.send(payload);
                        });
                        
//                        socket.send(payload);
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    });
});



