var createViewModel = require("./login-view-model").createViewModel;
var buttonModule = require('ui/button');
var application = require("application");
var platform = require("platform");
var View = require("ui/core/view");
function onNavigatingTo(args) {
    var page = args.object; 
    page.bindingContext = createViewModel();
 
    if (application.android) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
            args.cancel = true;
            args.activity.finish();
        });
    }
    page.cssFile = "Login-page.css";
    var btn = new buttonModule.Button();
    btn.id = "login-button"
}


exports.onNavigatingTo = onNavigatingTo;