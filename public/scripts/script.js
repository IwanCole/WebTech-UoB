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


var toggle_login = function (show) {
    $(".login").show();
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
