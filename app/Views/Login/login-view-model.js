var Observable = require("data/observable").Observable;
var frame = require('ui/frame');
var dialogs = require('ui/dialogs');
var http = require('http');
var topmost = frame.topmost();
var applicationSettings = require("application-settings");

function createViewModel() {
    var viewModel = new Observable();
    viewModel.id = "";
    viewModel.password = "";
    var server = applicationSettings.getString('server');
    console.log("SERVER "+ server);
    viewModel.login = function () {
        viewModel.id = viewModel.id.trim();
        viewModel.password = viewModel.password.trim();
        if (viewModel.id.length == 0 || viewModel.password.length == 0) {
            dialogs.alert("please provide valid Credentials");
        } else {
            http.getJSON(Const.FIREBASE).then(function (r) {
                applicationSettings.setString("server", r.S1);
                var key = applicationSettings.getString("s_key");
                if (key == undefined || key == null) {
                    var topmost = frame.topmost();
                    topmost.transition = {name: "flip"};
                    frame.topmost().navigate('/Views/Login/Login-page');
                } else {
                    var topmost = frame.topmost();
                    topmost.transition = {name: "flip"};
                    topmost.navigate('/Views/Home/Home-page');
                }
            }, function (e) {
                console.error("NHDHD" + e)
                dialogs.alert("Network Error");
            });


        }
    };

    return viewModel;
}


exports.createViewModel = createViewModel;