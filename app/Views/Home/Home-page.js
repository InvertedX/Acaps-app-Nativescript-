var buttonModule = require('ui/button');
var application = require("application");
var viewModel = require("./Home-viewmodal").createViewModel;
var dialog = require("ui/dialogs");
var frame = require("ui/frame");

function onNavigatingTo(args) {
    var page = args.object; 
    page.bindingContext = viewModel(page);
    /*if (application.android) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
            args.cancel = true;
            args.activity.finish();
        });
    }*/
    page.cssFile = "Home-Page.css";
}

exports.onNavigatingTo = onNavigatingTo;