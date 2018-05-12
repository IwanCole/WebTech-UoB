/*jslint browser: true*/
/*global $, jQuery, alert*/
'use strict';

var toggle_page_cover = function (show) {
    if (show) {
        $(".full-page-cover").fadeIn(1);
        $(".full-page-cover").css("opacity", "0.7");
    } else {
        $(".full-page-cover").css("opacity", "0");
        $(".full-page-cover").delay(400).fadeOut(1);
    }
};

var popup = function(text, status) {
    $(".status-popup-text").text(text);
    if (status == 0) {
        $(".status-popup-type").css("background-color", "#00d400");
    } else if (status == 1) {
        $(".status-popup-type").css("background-color", "#FBB13C");
    } else if (status == 2) {
        $(".status-popup-type").css("background-color", "#f50000");
    }
    $(".status-popup").addClass("status-popup-active");
    $(".status-popup-active").delay(3000).queue(function(next){
        $(this).removeClass("status-popup-active");
        next();
    });
};


var toggle_login = function (show) {
    $(".login").show();
};


var post_signup = function () {
    var inputs = $(".signup-input");
    var payload = {
        type:  "signup",
        name:  inputs[0].value,
        email: inputs[1].value,
        pass1: inputs[2].value,
        pass2: inputs[3].value,
        dname: inputs[4].value
    };
    
    
    $.post("/API-signup", payload)
           .done(function (data, staus) {
                console.log(data);
                popup("Signup submitted", 0);
            })
           .fail(function (xhr, error, statusCode) {
                popup((xhr.status.toString() + " " + statusCode), 2);
                console.log("xhr: " + xhr + "\nError: " + error + "\nStatus: " + statusCode);
            });
};


var test = function () {
    $(".home-signup-btn").toggleClass("home-signup-btn-hide");
    $(".signup").toggleClass("signup-hide");
};

var handler_signup = function () {
    var count = 0;
    var filled = false;
    
    $(".home-signup-btn").click(function () {
        
        if (!filled) {
            $(".home-welcome").addClass("home-welcome-hidden");
            $(".home-signup").addClass("signup-active");
            // Need the overflow to add whitespace around button
            $(".home-signup").delay(1900).fadeIn(0, function () {
                $(".home-signup").css("overflow", "inherit");
            });
        } else {
            $(".home-signup-btn").addClass("home-signup-btn-hide");
            $(".signup").addClass("signup-hide anim-signup-spin");
            post_signup();
        }
    });
    
    
    $(".signup-input").on("input", function () {
        var count = 0;
        var inputs = $(".signup-input");
        $.each(inputs, function (i) {
            if (inputs[i].value.length > 0) {
                count += 1;
            }
        });
        var alpha = count * 0.2;
        if (count == 5) { filled = true; }
        $("body").css("background-color", "rgba(216, 17, 89, " + alpha.toString() + ")");
    });
    
};

var handler_login = function () {
    $(".current-user-name").click(function () {
        toggle_page_cover(true);
        toggle_login(true);
    });
};



var main = function () {
    handler_signup();
    handler_login();
};

$("document").ready(main);
