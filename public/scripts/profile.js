var handler_me = function () {
    $(".current-user-name").click(function () {
        window.location.replace("/me");
    });
};


var post_delete = function () {
    $.post("/API-delete", "")
           .done(function (data, staus) {
                window.location.replace("/");
            })
           .fail(function (xhr, error, statusCode) {
                window.location.replace("/dashboard");
            });
};


var handler_delete = function () {
    $(".profile-delete").click(function () {
        if(confirm("Are you sure you'd like to delete your account?")) {
            post_delete();
        } else {
            create_popup("Cancelled deletion", 1);
        }
    });
};


var main = function () {
    handler_me();
    handler_delete();
    
    var col = Cookies.get("theme");
    if (col != undefined) {
        if (col == 1) {
            $("body").addClass("theme1");
        } else if (col == 2) {
            $("body").addClass("theme2");
        }
    } else {
        Cookies.set("theme", 1);
        $("body").addClass("theme1");
    }
};

$("document").ready(main);
