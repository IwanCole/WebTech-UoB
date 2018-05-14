/*jslint browser: true*/
/*global $, jQuery, alert*/
'use strict';

var toggle_blackout = function (show) {
    if (show) {
        $(".full-page-cover").addClass("full-page-cover-active");
        $(".signup > .sub-text").addClass("signup-glitch-fix");
    } else {
        $(".signup > .sub-text").removeClass("signup-glitch-fix");
        $(".full-page-cover").removeClass("full-page-cover-active");
    }
};


var create_popup = function(text, status) {
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


var create_cover = function(text) {
    $(".status-cover-text").html(text + "<br>Please click to dismiss.");
    toggle_blackout(true);
    $(".status-cover").addClass("status-cover-active");
    $(".status-cover").click(function () {
        toggle_blackout(false);
        $(".status-cover").removeClass("status-cover-active");
    });
};


var toggle_login = function (show) {
    $(".login").show();
};


var post_signup = function () {
    var inputs = $(".signup-input");
    var payload = {
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



function test() {
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
            post_signup();
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
        if (count == 5) { filled = true; }
        else { filled = false; }
        $("body").css("background-color", "rgba(216, 17, 89, " + alpha.toString() + ")");
    });
    
};

var handler_login = function () {
    $(".current-user-name").click(function () {
        toggle_blackout(true);
        toggle_login(true);
    });
};



var main = function () {
    $(".javascript-warning").remove();
    handler_signup();
    handler_login();
};

$("document").ready(main);
