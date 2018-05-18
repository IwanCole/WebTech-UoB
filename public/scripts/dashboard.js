/*jslint browser: true*/
/*global $, jQuery, alert, Cookies, create_popup, console, WebSocket*/
'use strict';

var serverIP = window.location.href.replace("http://", "").replace(":8080/dashboard", "");
var socketMainChat;// = new WebSocket('ws://' + serverIP + ':8081/');


var handler_me = function () {
    $(".current-user-name").click(function () {
        window.location.replace("/me");
    });
};


var send_message = function () {
    var session = Cookies.get("session"),
        message = $(".chat-main-input")[0].value,
        payload = JSON.stringify({
            session: session,
            data: message
        });
    socketMainChat.send(payload);
    $(".chat-main-input")[0].value = "";
};


var handler_send_message = function () {
    $(".chat-main-send").click(function () {
        send_message();
    });
    $(".chat-main-input").keydown(function (key) {
        if (key.keyCode ===  13) {
            send_message();
        }
    });
};


var insert_message = function (name, id, message) {
    var theme = "theme" + Cookies.get("theme"),
        $chatBubble = $("<div>", {"class" : theme + " chat-bubble"}),
        $messageName = $("<p>", {"class" : theme + " chat-message-name"}),
        $messageIcon = $("<a>", {"class" : theme + " chat-message-icon"}),
        $messageText = $("<p>", {"class" : theme + " chat-message-text"});
    
    
    $messageIcon.attr("href", "/profile?id=" + id);
    $messageIcon.text(name[0]);
    $messageName.text(name);
    $messageText.text(message);
    
    if (id === Cookies.get("myID")) {
        $chatBubble.attr("class", theme + " chat-bubble chat-bubble-me");
        $chatBubble.append($messageName).append($messageText).append($messageIcon);
    } else {
        $chatBubble.append($messageName).append($messageIcon).append($messageText);
    }
    $(".chat-main-cont").append($chatBubble);
    $(".chat-main-cont").scrollTop($(".chat-main-cont")[0].scrollHeight);
};


var handler_socket = function () {
    socketMainChat = new WebSocket('ws://' + serverIP + ':8081/');
    
    socketMainChat.onopen = function () {
        create_popup("Chat connected :)", 0);
    };
    socketMainChat.onmessage = function (payload) {
        console.log(payload.data);
        var data = JSON.parse(payload.data);
        insert_message(data.senderName, data.senderID, data.message);
    };
    socketMainChat.onerror = function (error) {
        create_popup("Chat error...", 1);
    };
    socketMainChat.onclose = function (code, reason) {
        create_popup("Chat connection closed", 2);
        socketMainChat.close();
    };
};



var main = function () {
    handler_socket();
    handler_me();
    handler_send_message();
    
    var col = Cookies.get("theme");
    if (col !== undefined) {
        if (col === "1") {
            $("body").addClass("theme1");
        } else if (col === "2") {
            $("body").addClass("theme2");
        }
    } else {
        Cookies.set("theme", 1);
        $("body").addClass("theme1");
    }
    
    window.onbeforeunload = function () {
//        socketMainChat.onclose = function () {}; // disable onclose handler first
        socketMainChat.close();
    };
    
};

$("document").ready(main);
