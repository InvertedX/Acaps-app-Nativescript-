var buttonModule = require('ui/button');
var application = require("application");
var observable = require("data/observable").Observable;
var PickerManager = require("nativescript-timedatepicker");
var moment = require("moment");
var appSetting = require("application-settings");
var loader = require('../../Utils/Utility').Loader;
var http = require('http');
var setupView = null;
var otpView = null;
var DateStamp = null;
function onNavigatingTo(args) {
    var page = args.object;
    page.cssFile = "Account-page.css";
    var Loaddialog =loader("Sending Otp..");
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
        if (DateStamp == null) {
            alert("Please provide valid Date");
            return;
        }
        if (viewModel.mob == "") {
            alert("Please provide valid Mobile number");
            return;
        }
        if (viewModel.mob.length >10 || viewModel.mob.length < 8) {
            alert("Please provide valid Mobile number");
            return;
        }
        Loaddialog.show();
        http.request({
            url: appSetting.getString("server") + "/api/setup/setup",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-acaps-key": appSetting.getString("s_key")
            },
            content: JSON.stringify({dob:DateStamp,mob:viewModel.mob})
        }).then(function (response) {
            Loaddialog.hide();
            setupView.visibility = "collapsed";
            otpView.visibility = "visible";

         }, function (e) {
            Loaddialog.hide();
            console.error(e);
        });

    };
    
    viewModel.submitOtp = function () {

    };


    page.bindingContext = viewModel;
}

exports.onNavigatingTo = onNavigatingTo;