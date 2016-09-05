var frame = require('ui/frame');
var dialogs = require('ui/dialogs');
var Observable = require("data/observable").Observable;
var application = require("application");
function onNavigatingTo(args) {
    var page = args.object;
    var viewModel = new Observable();
    viewModel.lol = function () {
        dialogs.confirm("Your message").then(function (what) {
            console.log(what);
            console.log("Dialog closed!");
        });
    };
    if (application.android) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
            args.cancel = true;
            args.activity.finish();
        });
    }
    page.bindingContext = viewModel;
}
exports.onNavigatingTo = onNavigatingTo;