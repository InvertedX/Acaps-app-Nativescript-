/**
 * Created by Sarath Kumar on 9/23/2016.
 */
var application = require("application");
var observable = require("data/observable").Observable;
var PickerManager = require("nativescript-timedatepicker");
var moment = require("moment");
var appSetting = require("application-settings");
var loader = require('../../Utils/Utility').Loader;
var http = require('http');
var frame = require('ui/frame');
var viewModel;
var KEY = require('../../Utils/Const').SS_KEY;
var listview;
var SERVER = require('../../Utils/Const').SERVER;
function onNavigatingTo(args) {

    var page = args.object;
    page.cssFile = "Account-page.css";
    var Loaddialog = loader("Loading your car details..");
    listview = page.getViewById('listview');
    viewModel = new observable();

    if (application.android) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
            args.cancel = true;
            var navigationEntry = {
                backstackVisible: true,
                clearHistory: false,
                moduleName: '/Views/Home/Home-page',
            };
            frame.topmost().transition = {name: "slideRight"};
            frame.topmost().navigate(navigationEntry);

        });
    }
    viewModel.add = function () {
        var navigationEntry = {
            backstackVisible: true,
            clearHistory: false,
            moduleName: '/Views/Add-Car/AddCar',
            context: viewModel.RideInfo
        };
        frame.topmost().transition = {name: "slideLeft"};

        frame.topmost().navigate(navigationEntry);
    };
    LoadList();
    page.bindingContext = viewModel;
}

function LoadList() {
    console.log("CALLE" + SERVER + "/api/cars");
    http.getJSON({
        url: SERVER + "/api/cars",
        method: "GET",
        headers: {
            "x-acaps-key": KEY
        }
    }).then(function (response) {
        console.dump(response);
        listview.items = response;
    }, function (e) {
        console.log(e);
    });

}
exports.onNavigatingTo = onNavigatingTo;
