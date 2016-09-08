var Observable = require("data/observable").Observable;
var frame = require('ui/frame');
var dialogs = require('ui/dialogs');
var http = require('http');
var Utility = require('../../Utils/Utility').Util();
var topmost = frame.topmost();
var applicationSettings = require("application-settings");

function createViewModel() {
    var viewModel = new Observable();
    viewModel.id = "";
    viewModel.password = "";
    var server = Utility.getServer();
    if (server == undefined || server == null) {
        dialogs.alert("Something went Wrong close the app and try again");
    }
    viewModel.isLoading = false;
    viewModel.login = function () {
        console.log("CLICK")
        viewModel.id = viewModel.id.trim();
        viewModel.password = viewModel.password.trim();
        if (viewModel.id.length == 0 || viewModel.password.length == 0) {
            alert("please provide valid Credentials");
        } else {
            viewModel.set('isLoading', true);
            http.request({
                url: server + '/api/login',
                method: "POST",
                headers: {"Content-Type": "application/json"},
                content: JSON.stringify({username: viewModel.id, password: viewModel.password})
            }).then(function (response) {
                viewModel.set('isLoading', false);
                if (response.statusCode != 200) {
                    alert("Invalid credentials,please try again")
                } else {
                    var response = JSON.parse(response.content);
                    var token = response.token;
                     
                    applicationSettings.setString('s_key', token);
                     if(response.isnew==true){

                         frame.topmost().navigate('/Views/AccountSettings/Account-page');

                     }else {
                         console.log("Spot ")
                         frame.topmost().navigate('/Views/Home/Home-page');

                     }
                }
            }, function (err) {
                viewModel.set('isLoading', false);
                alert("Acaps encountered an error trying to connect to the server.please try again");
            });


        }
    }
    ;

    return viewModel;
}


exports.createViewModel = createViewModel;