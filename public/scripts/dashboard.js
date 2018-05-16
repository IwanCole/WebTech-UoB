/*jslint browser: true*/
/*global $, jQuery, alert*/
'use strict';

var serverIP = window.location.href.replace("http://", "").replace(":8080/dashboard", "");
var socketMainChat = new WebSocket('ws://' + serverIP + ':8081/');


var handler_me = function () {
    $(".current-user-name").click(function () {
        window.location.replace("/me");
    });
};


var send_message = function () {
    var session = Cookies.get("session");
    var message = $(".chat-main-input")[0].value;
    var payload = JSON.stringify({
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
        if (key.keyCode ==  13) {
            send_message();
        }
    });
}


var insert_message = function (name, id, message) {
    var $chatBubble = $("<div>", {"class" : "chat-bubble"});
    var $messageName = $("<p>", {"class" : "chat-message-name"});
    var $messageIcon = $("<a>", {"class" : "chat-message-icon"});
    var $messageText = $("<p>", {"class" : "chat-message-text"});
    
    $messageIcon.attr("href", "/profile?id=" + id);
    $messageIcon.text(name[0]);
    $messageName.text(name);
    $messageText.text(message);
    
    $chatBubble.append($messageName).append($messageIcon).append($messageText);
    $(".chat-main-cont").append($chatBubble);
}




//var messageTemplate = `<div class="chat-main-cont">
//                    <div class="chat-bubble">
//                        <p class="chat-message-name">%%name%%</p>
//                        <p class="chat-message-icon">%%icon%%</p>
//                        <p class="chat-message-text">%%text%%</p>
//                    </div>
//                </div>`;


socketMainChat.onopen = function () {
    create_popup("Chat connected :)", 0);
};
socketMainChat.onmessage = function(payload) {
    console.log(payload.data);
    var data = JSON.parse(payload.data);
    insert_message(data.senderName, data.senderID, data.message);
};
socketMainChat.onerror = function(error) {
    create_popup("Chat error...", 1);
};
socketMainChat.onclose = function(code, reason) {
    create_popup("Chat connection closed", 2);
};


var main = function () {
    handler_me();
    handler_send_message();
};

$("document").ready(main);
