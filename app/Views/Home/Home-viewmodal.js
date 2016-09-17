/**
 * Created by Sarath Kumar on 9/7/2016.
 */

var Observable = require("data/observable").Observable;
var frame = require('ui/frame');
var PickerManager = require("nativescript-timedatepicker");
var LocationSearch = "/Views/LocationSearch/Search-Page";
var fullscreen_modal = false;
var moment = require('moment');

function createViewModel(page) {
    var topmost = frame.topmost();
    var viewModel = new Observable();
    var dateView = page.getViewById("dateGrid");
    dateView.visibility = "collapsed";
    viewModel.RideInfo = new Observable({
        source: "Choose",
        source_id: "",
        source_lat_lng: {},
        destination: "Choose",
        destination_id: "",
        destination_lat_lng: {},
        waypoints: [],
        waypoints_lat_lng: [],
        Date: "dd-mm-yyyy",
        DateStamp: null
    }); 
    viewModel.AddSource = function () {

         page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                viewModel.RideInfo.source = data.placename;
                viewModel.RideInfo.source_id = data.place_id;
                viewModel.RideInfo.source_lat_lng = data.place_id_lat_lng;
                if (viewModel.RideInfo.destination != "Choose") {
                    dateView.visibility = "visible"
                }

            }
        }, fullscreen_modal);

    };
    viewModel.AddDestination = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                viewModel.RideInfo.destination = data.placename;
                viewModel.RideInfo.destination_id = data.place_id;
                viewModel.RideInfo.destination_lat_lng = data.place_id_lat_lng;
                if (viewModel.RideInfo.source != "Choose") {
                    dateView.visibility = "visible"
                }
                console.log(JSON.stringify(viewModel.Location));
            }
        }, fullscreen_modal);


    };
    viewModel.OpendatePicker = function () {

        PickerManager.init(function (date) {
            if (date) {
                var timestamp = new moment(date, "DD MM YYYY HH:mm z");
                var SelectedDate = new Date(timestamp);
                var momentIns = new moment(SelectedDate);
                viewModel.RideInfo.set('Date', momentIns.format("LL"));
                viewModel.RideInfo.set('DateStamp', timestamp);
            }

        }, null, null, "Apply", "NotApply");

        PickerManager.showDatePickerDialog();
    };
    viewModel.findRide = function () {
        console.log("CLICK")
        var navigationEntry = {
            moduleName: '/Views/Login/Login-page'
         };
        topmost.navigate(navigationEntry);
    }; 
    viewModel.offerRide = function () { 
        var navigationEntry = {
            moduleName: '/Views/Offer-Ride/Offer-Ride',
            context : viewModel.RideInfo
         };
        topmost.navigate(navigationEntry);
    };
    
    
    return viewModel;
 
}


exports.createViewModel = createViewModel;