/*jslint browser: true*/
/*global $, jQuery, alert, console, Cookies, create_popup, create_cover*/
'use strict';


/* ---------------------------------------------

Handler for navigating to logged-in user's profile

---------------------------------------------- */
var handler_me = function () {
    $(".current-user-name").click(function () {
        window.location.replace("/me");
    });
};


/* ---------------------------------------------

Handler for testing the notification feature

---------------------------------------------- */
var handle_notif_test = function () {
    $(".about-test").keydown(function (key) {
        if ($(".about-test")[0].value !== "" && $(".about-test")[0].value !== undefined) {
            if (key.keyCode === 13) {
                create_popup($(".about-test")[0].value, 0);
                $(".about-test")[0].value = "";
            }
        }
    });
};


var main = function () {
    handler_me();
    handle_notif_test();
    var col = Cookies.get("theme");
    if (col !== undefined) {
        if (col === "1") {
            $("html").addClass("theme1");
        } else if (col === "2") {
            $("html").addClass("theme2");
        }
    } else {
        Cookies.set("theme", 1);
        $("html").addClass("theme1");
    }
};

$("document").ready(main);
