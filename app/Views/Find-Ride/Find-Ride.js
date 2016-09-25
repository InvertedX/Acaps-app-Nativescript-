/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var buttonModule = require('ui/button');
var Observable = require("data/observable").Observable;
var application = require("application");
var context, viewModel;
var frame = require("ui/frame");
var fullscreen_modal = false;
var LocationSearch = "/Views/LocationSearch/Search-Page";
var moment = require('moment');
var PickerManager = require("nativescript-timedatepicker");
var appsettings = require("application-settings");
var http = require("http");
var Listview = null;
var loaderspinner;
var topmost, rides, empty;

function onNavigatingTo(args) {
    var page = args.object;
    topmost = frame.topmost();
    page.cssFile = "Find-Ride.css";
    if (page.navigationContext) {
        context = page.navigationContext;
    }
    viewModel = new Observable();
    viewModel.RideInfo = context;
    empty = page.getViewById('empty');
    empty.visibility = "collapsed";
    viewModel.itemTap = function (args) {
        console.log(args.index);
        console.dump(rides[args.index]);
        console.log(JSON.stringify(rides[args.index]));
        var navigationEntry = {
            backstackVisible: true,
            moduleName: '/Views/RideView/RideView-Page',
            context: rides[args.index]
        };
        topmost.transition = {name: "slideLeft"};

        topmost.navigate(navigationEntry);

    };

    Listview = page.getViewById("Listview");
    loaderspinner = page.getViewById("loaderspinner");
    loaderspinner.visibility = "visible";
    Listview.visibility = "collapsed";
    getRides();
    viewModel.AddSource = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                viewModel.RideInfo.source = data.placename;
                viewModel.RideInfo.source_id = data.place_id;
                viewModel.RideInfo.source_latlng = data.place_id_lat_lng;
            }
        }, fullscreen_modal);

    };
    viewModel.AddDestination = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                viewModel.RideInfo.destination = data.placename;
                viewModel.RideInfo.destination_id = data.place_id;
                viewModel.RideInfo.destination_latlng = data.place_id_lat_lng;

            }
        }, fullscreen_modal);


    };
    viewModel.OpendatePicker = function () {
        var SelectedDate = new Date(viewModel.RideInfo.travel_date_time);
        PickerManager.init(function (date) {
            if (date) {
                var timestamp = new moment(date, "DD MM YYYY HH:mm z");
                var SelectedDate = new Date(timestamp);
                var momentIns = new moment(SelectedDate);
                viewModel.RideInfo.set('Date', momentIns.format("LL"));
                viewModel.RideInfo.set('Time', momentIns.format("hh:mm a"));
                viewModel.RideInfo.set('travel_date_time', timestamp);
            }

        }, null, null, "Apply", "NotApply");

        PickerManager.showDatePickerDialog();
    };
    viewModel.search = function () {
        getRides();
    };
    page.bindingContext = viewModel;

}

function getRides() {
    loaderspinner.visibility = "visible";
    Listview.visibility = "collapsed";
    var payload = {
        source_id: viewModel.RideInfo.source_id,
        destination_id: viewModel.RideInfo.destination_id,
        date: viewModel.RideInfo.travel_date_time
    };
    console.dump(payload);
    http.request({
        url: appsettings.getString("server") + "/api/rides",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-acaps-key": appsettings.getString("s_key")
        },
        content: JSON.stringify(payload)
    }).then(function (data) {
        loaderspinner.visibility = "collapsed";
        Listview.visibility = "visible";
        try {
            console.log(data.content);
            rides = JSON.parse(data.content);
            if (data.statusCode == 200) {
                if(rides.length==0){
                    empty.visibility = "visible";
                    Listview.visibility = "collapsed";

                }
                Listview.items = rides;
            }
        } catch (err) {
            console.log(err)
        }
        if (data.statusCode == 401) {

        }
    }, function (error) {
        loaderspinner.visibility = "collapsed";
        Listview.visibility = "visible";

    });
}


exports.onNavigatingTo = onNavigatingTo;

exports.onNavBtnTap = function () {
    console.log("CLICK");
    frame.topmost().goBack();
};