var Utility = require('../../Utils/Utility').Util();
var Const = require('../../Utils/Const').Const;
var applicationSettings = require("application-settings");
var frame = require('ui/frame');
var http = require("http");
var Page = require("ui/page");
var dialogs = require("ui/dialogs");
var Observable = require("data/observable").Observable;
var activityIndicatorModule = require("ui/activity-indicator");
var loader = require('../../Utils/Utility').Loader;
var topmost;
function onNavigatingTo(args) {
    var page = args.object;
    topmost = frame.topmost();
    var viewModel = new Observable();
    viewModel.isLoading = true;
    var indicator = new activityIndicatorModule.ActivityIndicator();
    indicator.busy = false;
    var Loader = loader("Loading..");
    /* topmost.transition = {name: "fade"};
     var navigationEntry = {
     moduleName: '/Views/RideView/RideView-Page',
     clearHistory: true
     };
     topmost.transition = {name: "slideLeft"};
     topmost.navigate(navigationEntry);
     return;*/
    viewModel.GetServer = function () {
        Loader.show();
        http.getJSON(Const.FIREBASE).then(function (r) {
            applicationSettings.setString("server", r.S1);
            applicationSettings.setString("ky", r.KY);
            var key = applicationSettings.getString("s_key");
            if (key == undefined || key == null) {
                Loader.hide();
                try {
                    topmost.transition = {name: "fade"};

                    var navigationEntry = {
                        moduleName: '/Views/Login/Login-page',
                        clearHistory: true
                    };
                    topmost.navigate(navigationEntry);
                } catch (er) {
                    console.log(er);
                }

            } else {
                http.request({
                    url: applicationSettings.getString("server") + "/api/user",
                    method: "GET",
                    headers: {
                        "x-acaps-key": applicationSettings.getString("s_key")
                    }
                }).then(function (response) {
                    console.log("Server connect");
                    Loader.hide();
                    if (response.statusCode == 401) {
                        topmost.transition = {name: "fade"};
                        var navigationEntry = {
                            moduleName: '/Views/Login/Login-page',
                            clearHistory: true
                        };
                        topmost.navigate(navigationEntry);
                        return;
                    }
                    try {
                        var data = JSON.parse(response.content);
                        if (data) {
                            if (data.Activated == true) {
                                var navigationEntry = {
                                    moduleName: '/Views/Home/Home-page',
                                    backstackVisible: false,
                                    clearHistory: true
                                };
                                topmost.transition = {name: "fade"};
                                topmost.navigate(navigationEntry);
                            } else {

                                topmost.transition = {name: "fade"};

                                topmost.navigate('/Views/AccountSettings/Account-page');

                            }
                        } else {
                            var navigationEntry = {
                                moduleName: '/Views/AccountSettings/AccountSettings-page',
                                clearHistory: true
                            };
                            topmost.transition = {name: "slideRight"};
                            topmost.navigate(navigationEntry);
                        }
                    } catch (er) {
                        console.log(er);
                    }
                }, function (e) {
                    Loader.hide();

                    var options = {
                        title: "Error",
                        message: "couldn't connect to server",
                        okButtonText: "Retry",
                        cancelButtonText: "No"
                    };

                    dialogs.confirm(options).then(function (result) {
                        if (result == true) {
                            viewModel.GetServer();
                        }
                    });
                    console.log("Server Error");
                    console.error(e);
                });
            }
        }, function (e) {
            Loader.hide();

            dialogs.alert("Network Error");
        });

    };
    viewModel.GetServer();

    page.bindingContext = viewModel;


}

exports.onNavigatingTo = onNavigatingTo;