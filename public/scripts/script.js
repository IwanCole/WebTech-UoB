/*jslint browser: true*/
/*global $, jQuery, alert, console, Cookies, create_popup, create_cover*/
'use strict';

var theme = "";


/* ---------------------------------------------

Toggle a semi transparent page blackout to enable
important messages to stand out, preventing access
to the page until the message has been dismissed

---------------------------------------------- */
var toggle_blackout = function (show) {
    if (show) {
        $(".full-page-cover").addClass("full-page-cover-active");
        $(".signup > .sub-text").addClass("signup-glitch-fix");
    } else {
        $(".signup > .sub-text").removeClass("signup-glitch-fix");
        $(".full-page-cover").removeClass("full-page-cover-active");
    }
};


/* ---------------------------------------------

Create a custom notification to appear. Text is the 
content, and status 0 = Ok, 1 = Warning, 2 = Error.
Popup notification disappears after 3 seconds.

---------------------------------------------- */
var create_popup = function (text, status) {
    $(".status-popup-text").text(text);
    if (status === 0) {
        $(".status-popup-type").css("background-color", "#00d400");
    } else if (status === 1) {
        $(".status-popup-type").css("background-color", "#FBB13C");
    } else if (status === 2) {
        $(".status-popup-type").css("background-color", "#f50000");
    }
    $(".status-popup").addClass("status-popup-active");
    $(".status-popup-active").delay(3000).queue(function (next) {
        $(this).removeClass("status-popup-active");
        next();
    });
};


/* ---------------------------------------------

Create an "important" notification by creating a 
large message window, covering the rest of the page.

---------------------------------------------- */
var create_cover = function (text) {
    $(".status-cover-text").html(text + "<br>Please click to dismiss.");
    toggle_blackout(true);
    $(".status-cover").addClass("status-cover-active");
    $(".status-cover").click(function () {
        toggle_blackout(false);
        $(".status-cover").removeClass("status-cover-active");
    });
};


/* ---------------------------------------------

POST function for user signups. Uses callbacks to
handle success/failure of the user signup.

---------------------------------------------- */
var post_signup = function () {
    var inputs = $(".signup-input"),
        payload = {
            type:  "t_signup",
            name:  inputs[0].value,
            email: inputs[1].value,
            pass1: inputs[2].value,
            pass2: inputs[3].value,
            dname: inputs[4].value
        };

    $(".home-signup-btn").addClass("home-signup-btn-hide");
    $(".signup").addClass("signup-hide anim-signup-spin");
    $.post("/API-signup", payload)
           .done(function (data, staus) {
            console.log(data);
            if (data['success']) {
                create_popup(data['info'], 0);
                window.location.replace("/dashboard");
            } else {
                create_cover(data['info']);
                $(".home-signup-btn").removeClass("home-signup-btn-hide");
                $(".signup").removeClass("signup-hide anim-signup-spin");
            }
            })
           .fail(function (xhr, error, statusCode) {
            create_popup((xhr.status.toString() + " " + statusCode), 2);
            console.log("xhr: " + xhr + "\nError: " + error + "\nStatus: " + statusCode);
            $(".home-signup-btn").removeClass("home-signup-btn-hide");
            $(".signup").removeClass("signup-hide anim-signup-spin");
            });
};


/* ---------------------------------------------

POST function for user logins. Uses callbacks to
handle success/failure of the user signup.

---------------------------------------------- */
var post_login = function () {
    var inputs = $(".login-input"),
        payload = {
            type:  "t_login",
            email: inputs[0].value,
            pass1: inputs[1].value
        };

    $(".home-login").removeClass("home-login-active");
    $.post("/API-login", payload)
           .done(function (data, staus) {
            console.log(data);
            if (data['success']) {
                window.location.replace("/dashboard");
            } else {
                create_cover(data['info']);
                $(".home-login").addClass("home-login-active");
            }
            })
           .fail(function (xhr, error, statusCode) {
            create_popup((xhr.status.toString() + " " + statusCode), 2);
            console.log("xhr: " + xhr + "\nError: " + error + "\nStatus: " + statusCode);
            $(".home-login").addClass("home-login-active");
            });
};


/* ---------------------------------------------

Creates appropriate event handlers for the user
signup process. Does some minimal data validation
by counting filled input fields. Concrete validation
is done server-side to fully trust the data.

---------------------------------------------- */
var handler_signup = function () {
    var count = 0,
        filled = false;

    $(".home-signup-btn").click(function () {

        if (!filled) {
            $(".home-welcome").addClass("home-welcome-hidden");
            $(".home-signup").addClass("signup-active");
            // Need the overflow to add whitespace around button
            $(".home-signup").delay(1900).fadeIn(0, function () {
                $(".home-signup").css("overflow", "inherit");
            });
        } else {
            post_signup();
        }
    });
    
    $(".signup-input").keydown(function (key) {
        if (filled) {
            if (key.keyCode === 13) {
                post_signup();
            }
        }
    });

    $(".signup-input").on("input", function () {
        count = 0;
        var inputs = $(".signup-input");
        $.each(inputs, function (i) {
            if (inputs[i].value.length > 0) {
                count += 1;
            }
        });
        var alpha = count * 0.2;
        if (count === 5) {
            filled = true;
        } else {
            filled = false;
        }
        if (Cookies.get("theme") === "2") {
            $("body").css("background-color", "rgba(48, 87, 196, " + alpha.toString() + ")");
        } else {
            $("body").css("background-color", "rgba(216, 17, 89, " + alpha.toString() + ")");
        }
    });
};


/* ---------------------------------------------

Creates appropriate event handlers for the user
Login process.

---------------------------------------------- */
var handler_login = function () {
    $(".current-user-name").click(function () {
        $(".home-signup").addClass("signup-active");
        $(".home-signup").css("overflow", "inherit");
        $(".home-welcome").addClass("home-welcome-hidden");
        
        if (Cookies.get("theme") === "2") {
            $("body").css("background-color", "rgb(48, 87, 196)");
        } else {
            $("body").css("background-color", "rgb(216, 17, 89)");
        }
        
        $(".home-login").addClass("home-login-active");
        $(".home-signup-btn").addClass("home-signup-btn-hide");
        $(".signup").addClass("signup-hide anim-signup-spin");
//        }
    });

    $(".home-login-btn").click(function () {
        post_login();
    });
    $(".login-input").keydown(function (key) {
        if (key.keyCode === 13) {
            post_login();
        }
    });
};


/* ---------------------------------------------

Apply the currently selected colour theme.

---------------------------------------------- */
var apply_theme = function (theme) {
    var old, next;
    if (theme === 1) {
        old  = "theme2";
        next = "theme1";
    } else {
        old  = "theme1";
        next = "theme2";
    }
    $(".home-signup-btn, .title, .sub-title, .sub-text, .divider, .home-login-btn, .signup, .login, footer, .chat-main-compose, .chat-main-input, .chat-main-send, .chat-message-name, .chat-message-icon, .chat-message-text, .chat-bubble-me, .nav-item-icon-cont, .nav-item-text, .profile-name, .profile-dname, .profile-delete, .about-test-container, .about-test-text").removeClass(old).addClass(next);
    var url = window.location.href.toString();
    if (url.indexOf("dashboard") !== -1 || url.indexOf("profile") !== -1) {
        $("body").removeClass(old).addClass(next);
    } else if (url.indexOf("about") !== -1) {
        $("html").removeClass(old).addClass(next);
    }
};


/* ---------------------------------------------

Creates event handlers for applying colour theme.

---------------------------------------------- */
var handler_theme_apply = function () {
    var col = Cookies.get("theme");
    if (col !== undefined) {
        console.log(col);
        if (col === "1") {
            theme = "theme1";
            apply_theme(1);
        } else if (col === "2") {
            theme = "theme2 ";
            apply_theme(2);
        }
    } else {
        Cookies.set("theme", 1);
        theme = "theme1";
        apply_theme(1);
    }
};
    

/* ---------------------------------------------

Creates event handlers for switching colour theme.

---------------------------------------------- */
var handler_theme_switch = function () {
    $(".material-icons").click(function () {
        toggle_blackout(true);
        $(".colour-picker").fadeIn(400);
        $(".colour1").click(function () {
            Cookies.set("theme", 1);
            apply_theme(1);
            toggle_blackout(false);
            $(".colour-picker").fadeOut(400);
        });
        $(".colour2").click(function () {
            Cookies.set("theme", 2);
            apply_theme(2);
            toggle_blackout(false);
            $(".colour-picker").fadeOut(400);
        });
    });
};


var main = function () {
    $(".javascript-warning").remove();
    handler_signup();
    handler_login();
    handler_theme_switch();
    handler_theme_apply();
};

$("document").ready(main);
