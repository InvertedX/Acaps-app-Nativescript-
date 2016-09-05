 var buttonModule = require('ui/button');
var application = require("application");

function onNavigatingTo(args) {
    var page = args.object;
    if (application.android) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
           console.log("Back");
            args.cancel = true;
            args.activity.finish();
        });
    }
}

exports.onNavigatingTo = onNavigatingTo;