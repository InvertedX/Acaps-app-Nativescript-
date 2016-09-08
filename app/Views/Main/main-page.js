var Utility = require('../../Utils/Utility').Util();
var Const = require('../../Utils/Const').Const;
var applicationSettings = require("application-settings");
var frame = require('ui/frame');
var http = require("http");
var Page = require("ui/page");
var dialogs = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var activityIndicatorModule = require("ui/activity-indicator");

function onNavigatingTo(args) {
    var page = args.object;
    var viewModel = new Observable();
    viewModel.isLoading = true;
    var indicator = new activityIndicatorModule.ActivityIndicator();
    indicator.busy = true;
    page.bindingContext = viewModel;
    http.getJSON(Const.FIREBASE).then(function (r) {
        applicationSettings.setString("server", r.S1);
        var key = applicationSettings.getString("s_key");
        console.log("KEY", key);
        if (key == undefined || key == null) {
            var topmost = frame.topmost();
            topmost.transition = {name: "slideBottom"};
            var navigationEntry = {
                moduleName: '/Views/Login/Login-page',
                clearHistory: true
            };
            topmost.navigate(navigationEntry);
        } else {

            var topmost = frame.topmost();
            var navigationEntry = {
                moduleName: '/Views/Home/Home-page',
                clearHistory: true
            };
            topmost.transition = {name: "slideTop"};

            topmost.navigate(navigationEntry);

        }
    }, function (e) {
        dialogs.alert("Network Error");
    });


}
exports.onNavigatingTo = onNavigatingTo;