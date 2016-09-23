var buttonModule = require('ui/button');
var application = require("application");
var observable = require("data/observable").Observable;
var PickerManager = require("nativescript-timedatepicker");
var moment = require("moment");
var appSetting = require("application-settings");
var loader = require('../../Utils/Utility').Loader;
var http = require('http');
var frame = require('ui/frame');
var setupView = null;
var otpView = null;
var DateStamp = null;
function onNavigatingTo(args) {
    var page = args.object;
    page.cssFile = "Account-page.css";
    var Loaddialog = loader("Sending Otp..");
    var viewModel = new observable();
    if (page.navigationContext == "new") {
        viewModel.setup = true;
    }
    setupView = page.getViewById("setup");
    otpView = page.getViewById("otp");
    otpView.visibility = "collapsed";
    viewModel.dob = "";
    viewModel.mob = "";
    viewModel.otp = "";

    viewModel.OpendatePicker = function () {
        PickerManager.init(function (date) {
            if (date) {
                var timestamp = new moment(date, "DD MM YYYY HH:mm z");
                var SelectedDate = new Date(timestamp);
                DateStamp = timestamp;
                var momentIns = new moment(SelectedDate);
                viewModel.set('dob', momentIns.format("LL"));
            }

        }, null, null, "Apply", "NotApply");

        PickerManager.showDatePickerDialog();
    };

    viewModel.submitSetup = function () {
        if (viewModel.mob == "") {
            alert("Please provide valid Mobile number");
            return;
        }
        if (viewModel.mob.length > 10 || viewModel.mob.length < 8) {
            alert("Please provide valid Mobile number");
            return;
        }
        Loaddialog.show();
        http.request({
            url: appSetting.getString("server") + "/api/setup/otp",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-acaps-key": appSetting.getString("s_key")
            },
            content: JSON.stringify({mob: viewModel.mob})
        }).then(function (response) {
            Loaddialog.hide();
            var content = JSON.parse(response.content);
            if (content.status == true) {

                setupView.visibility = "collapsed";
                otpView.visibility = "visible";
            } else {
                alert("Invalid otp Code please try again")
            }
        }, function (e) {
            Loaddialog.hide();
            console.error(e);
        });

    };

    viewModel.submitOtp = function () {
        var Loaddialog = loader("Verifying Otp..");

        if (viewModel.otp == "") {
            alert("Enter Otp Code")
            return;
        } else if (viewModel.otp.length != 6) {
            alert("Please enter valid Otp Code")
            return;
        }
        Loaddialog.show();
        http.request({
            url: appSetting.getString("server") + "/api/setup/otp_varify",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-acaps-key": appSetting.getString("s_key")
            },
            content: JSON.stringify({otp: viewModel.otp})
        }).then(function (response) {
            Loaddialog.hide();
            try {

                var content = JSON.parse(response.content);
                console.dump(content);
                if (content.status == true) {
                    frame.topmost().transition = {name: "fade"};
                    var navigationEntry = {
                        moduleName: '/Views/Main/main-page',
                        clearHistory: true
                    };
                    frame.topmost().transition = {name: "slideLeft"};
                    frame.topmost().navigate(navigationEntry);

                }
            } catch (er) {
                console.log(er);
            }
        }, function (e) {
            Loaddialog.hide();
            console.error(e);
        });

    };


    page.bindingContext = viewModel;
}

exports.onNavigatingTo = onNavigatingTo;