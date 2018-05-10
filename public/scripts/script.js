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


var handler_login_signup = function () {
    $(".home-signup-btn").click(function () {
        $(".home-welcome").addClass("home-welcome-hidden");
        $(".home-signup").addClass("signup-active");
    });
    
    $(".current-user-name").click(function () {
        toggle_page_cover(true);
        toggle_login(true);
    });
};



var main = function () {
    handler_login_signup();
};

$("document").ready(main);
