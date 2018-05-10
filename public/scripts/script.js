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


var toggle_portal = function (type, show) {
    if (type == 1) {
//        $(".signup").addClass("signup-active");    
    } else {
        $(".login").show();
    }
//    $(".home-portal").toggleClass("card-active");
};


var handler_login_signup = function () {
    $(".home-signup-btn").click(function () {
//        toggle_page_cover(true);
        $(".home-welcome").addClass("home-welcome-hidden");
//        $(".home-signup-btn").addClass("home-signup-btn-a");
        $(".home-signup").addClass("signup-active");
        toggle_portal(1, true);
    });
    $(".current-user-name").click(function () {
        toggle_page_cover(true);
        toggle_portal(2, true);
    });
};



var main = function () {
    handler_login_signup();
};

$("document").ready(main);
