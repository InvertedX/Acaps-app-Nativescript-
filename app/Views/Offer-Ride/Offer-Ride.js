/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var application = require("application");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var index = 1;
var source_lat_lng, destination_lat_lng;
var DirectionParser = require('./DirectionApiParser').Parse;
var dialogs = require('ui/dialogs');
var mapView;
var context = null;
var mapsModule = require("nativescript-google-maps-sdk");
var viewModel = null;
var moment = require('moment');
var CalculateFare = require('../../Utils/Utility').PriceCalculate;
var PickerManager = require("nativescript-timedatepicker");
var mDistance = 1;
var genders = ['none', 'male', 'female'];
var LocationSearch = "/Views/LocationSearch/Search-Page";
var fullscreen_modal = false;
var Map_args = null;
var listwaypoints;
var mapProgress;
function onNavigatingTo(args) {
    var page = args.object;
    if (page.navigationContext) {
        context = page.navigationContext;
    }
    page.cssFile = "Offer-Ride.css";
    viewModel = new Observable();
    listwaypoints = page.getViewById("listwaypoints");
    var genderpicker = page.getViewById("GenderPicker");
    mapProgress = page.getViewById("mapProgreess");
    mapProgress.visibility = "collapsed";
    genderpicker.items = genders;
    viewModel.RideInfo = context;
    viewModel.index = 0;
    viewModel.Selected = context;
    viewModel.fareSelectorVisibilty = "visible";
    viewModel.RideInfo.freeride = false;
    viewModel.RideInfo.waypoints = [];
    viewModel.RideInfo.waypoints_id = [];
    viewModel.RideInfo.waypoints_lat_lng = [];
    viewModel.changeToFree = function () {
        if (viewModel.RideInfo.freeride == true) {
            viewModel.set('fareSelectorVisibilty', "visible");
            viewModel.RideInfo.genderpref = genders[viewModel.index];

        } else {
            viewModel.set('fareSelectorVisibilty', "collapsed");
            viewModel.RideInfo.genderpref = genders[viewModel.index];
        }
    };
    viewModel.RideInfo.genderpref = genders[viewModel.index];
    viewModel.RideInfo.Seats = 1;
    viewModel.RideInfo.description = "";
    viewModel.RideInfo.Time = "12:00 pm";
    viewModel.RideInfo.price = 0;
    viewModel.MaxPrice = 0;
    viewModel.MinPrice = 0;
    viewModel.latitude = 6;
    viewModel.zoom = 9;
    viewModel.longitude = 60; 
    
    viewModel.AddSource = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                clearMap();
                viewModel.RideInfo.source = data.placename;
                viewModel.RideInfo.source_id = data.place_id;
                viewModel.RideInfo.source_lat_lng = data.place_id_lat_lng;
                onMapReady(Map_args);
            }
        }, fullscreen_modal);

    };
    viewModel.AddDestination = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                clearMap();
                viewModel.RideInfo.destination = data.placename;
                viewModel.RideInfo.destination_id = data.place_id;
                viewModel.RideInfo.destination_lat_lng = data.place_id_lat_lng;
                onMapReady(Map_args);

            }
        }, fullscreen_modal);


    }; 
    viewModel.seatsManage = {
        Add: function () {
            if (viewModel.RideInfo.Seats < 12) {
                viewModel.RideInfo.set("Seats", viewModel.RideInfo.Seats + 1);
                console.log("add" + viewModel.RideInfo.Seats);
                FareManage(mDistance)
            }
        },
        Sub: function () {
            if (viewModel.RideInfo.Seats > 1) {
                console.log("sUB");
                viewModel.RideInfo.set("Seats", viewModel.RideInfo.Seats - 1);
                FareManage(mDistance);

            }
        }
    }; 
    viewModel.addWaypont = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                viewModel.RideInfo.waypoints.push(data.placename);
                viewModel.RideInfo.waypoints_id.push(data.place_id);
                viewModel.RideInfo.waypoints_lat_lng.push(data.place_id_lat_lng);
                viewModel.WayPoints.setItem(viewModel.WayPoints.length++, {location: data.placename})
                console.log("SDDD", listwaypoints.height + 50);
                listwaypoints.height = listwaypoints.height + 50;
                clearMap();
                onMapReady(Map_args);

            }
        }, fullscreen_modal);
    }; 
    viewModel.WayPoints = new ObservableArray();

    viewModel.TimePicker = function () {
        var SelectedDate = new Date(viewModel.RideInfo.DateStamp);
        PickerManager.init(function (Time) {
            if (Time) {
                var timestamp = new moment(Time, "DD MM YYYY HH:mm z");
                var SelectedDate = new Date(timestamp);
                var momentIns = new moment(SelectedDate);
                viewModel.RideInfo.set('Time', momentIns.format("hh:mm a"));
                viewModel.RideInfo.set('Date', momentIns.format("LL"));
                viewModel.RideInfo.set('DateStamp', timestamp);
            }

        }, "", SelectedDate);
        PickerManager.showTimePickerDialog();

    };

    viewModel.OpendatePicker = function () {
        var SelectedDate = new Date(viewModel.RideInfo.DateStamp);
        console.log(SelectedDate);
        PickerManager.init(function (date) {
            if (date) {
                console.log(date);
                var timestamp = new moment(date, "DD MM YYYY HH:mm z");
                var SelectedDate = new Date(timestamp);
                var momentIns = new moment(SelectedDate);
                viewModel.RideInfo.set('Date', momentIns.format("LL"));
                viewModel.RideInfo.set('Time', momentIns.format("hh:mm a"));
                viewModel.RideInfo.set('DateStamp', timestamp);
            }

        }, "Select Date", SelectedDate);

        PickerManager.showDatePickerDialog();
    };
    viewModel.finish = function () {
        if(viewModel.RideInfo.source =="Choose"){
            alert("Source Field is required")
            return;
        }
        if(viewModel.RideInfo.destination =="Choose"){
            alert("Destination Field is required")
            return;
        }
       if(viewModel.RideInfo.description =="Choose"){
            alert("Destination Field is required")
            return;
        } 
    };
    viewModel.GenderPref = function (args) {
        setTimeout(function () {
            viewModel.RideInfo.set("genderpref", args.object.id);
            console.log(args.object.id);
        }, 100);

    };
    page.bindingContext = viewModel;
}
exports.deleteWaypoints = function (args) {
    var index = viewModel.RideInfo.waypoints.indexOf(args.object.id);
    var options = {
        title: "Delete Waypoints",
        message: "Are you sure you want to Delete Waypoint " + viewModel.RideInfo.waypoints[index] + " ?",
        okButtonText: "Yes",
        cancelButtonText: "No",
        neutralButtonText: "Cancel"
    };
    dialogs.confirm(options).then(function (result) {
        if (result == true) {
            viewModel.RideInfo.waypoints.splice(index, 1);
            viewModel.RideInfo.waypoints_lat_lng.splice(index, 1);
            viewModel.RideInfo.waypoints_id.splice(index, 1);
            viewModel.WayPoints.splice(index, 1);
            listwaypoints.height = listwaypoints.height - 50;

            clearMap();
            onMapReady(Map_args);
        }
    });
    console.log(index);
};

function clearMap() {
    try {
        mapView.removeAllPolylines();
        mapView.removeAllMarkers();
    } catch (Err) {
        console.error(Err);
    }

}

function FareManage(Distance) {
    console.log("CALLED");
    mDistance = Distance;
    var fare = CalculateFare(Distance, 10, viewModel.RideInfo.Seats);
    viewModel.set('MaxPrice', fare.maximum);
    viewModel.set('MinPrice', fare.minimum);
    viewModel.RideInfo.set('price', fare.avg)
    console.log(JSON.stringify(fare));
}

function onMapReady(args) {
    console.log("MAP Ready")
    Map_args = args;
    mapView = args.object;
    try {
        source_lat_lng = viewModel.RideInfo.source_lat_lng;
        var markerSource = new mapsModule.Marker();
        markerSource.position = mapsModule.Position.positionFromLatLng(source_lat_lng.lat, source_lat_lng.lng);
        markerSource.title = viewModel.RideInfo.source;
        markerSource.snippet = "India";
        markerSource.userData = {index: index};
        index++;
        mapView.addMarker(markerSource);
        destination_lat_lng = viewModel.RideInfo.destination_lat_lng;
        var markerDestination = new mapsModule.Marker();
        markerDestination.position = mapsModule.Position.positionFromLatLng(destination_lat_lng.lat, destination_lat_lng.lng);
        markerDestination.title = viewModel.RideInfo.destination;
        markerDestination.snippet = "India";
        markerDestination.userData = {index: index};
        index++;
        mapView.addMarker(markerDestination);
        for (var i = 0; i < viewModel.RideInfo.waypoints.length; i++) {
            console.log("SD", viewModel.RideInfo.waypoints[i]);
            var markerWaypoints = new mapsModule.Marker();
            markerWaypoints.position = mapsModule.Position.positionFromLatLng(viewModel.RideInfo.waypoints_lat_lng[i].lat, viewModel.RideInfo.waypoints_lat_lng[i].lng);
            markerWaypoints.title = viewModel.RideInfo.waypoints[i];
            markerWaypoints.snippet = "India";
            markerWaypoints.userData = {index: index};
            index++;
            mapView.addMarker(markerWaypoints);
        }
        mapProgress.visibility = "visible";
        RouteFind();
    } catch (er) {
        console.error(er);
    }


}

function onMarkerSelect(args) {
    console.log("Clicked on " + args.marker.title);
}

function RouteFind() {
    DirectionParser(viewModel.RideInfo.source_id, viewModel.RideInfo.waypoints_id, viewModel.RideInfo.destination_id, mapsModule, function (data, poly, distance) {
        console.log("DISTACNE ", distance);
        FareManage(distance);
        var zoomLevel = 1;
        var latnorth = data.routes[0].bounds.northeast.lat;

        var longnorth = data.routes[0].bounds.northeast.lng;
        var lat = data.routes[0].bounds.southwest.lat;

        var long = data.routes[0].bounds.southwest.lng;

        var avglat = (latnorth + lat) / 2;

        var avglng = (longnorth + long) / 2;

        var latDiff = latnorth - lat;
        var lngDiff = longnorth - long;

        var maxDiff = (lngDiff > latDiff) ? lngDiff : latDiff;
        if (maxDiff < 360 / Math.pow(2, 20)) {
            zoomLevel = 21;
        } else {
            zoomLevel = (-1 * ( (Math.log(maxDiff) / Math.log(2)) - (Math.log(360) / Math.log(2))));
            if (zoomLevel < 1)
                zoomLevel = 1;
        }
        mapView.addPolyline(poly);
        mapProgress.visibility = "collapsed";

        console.log(avglat);
        console.log(avglng);
        console.log(zoomLevel);
        viewModel.set("zoom", zoomLevel - 0.500);
        viewModel.set("latitude", avglat);
        viewModel.set("longitude", avglng);

    })

}

exports.onMapReady = onMapReady;
exports.onMarkerSelect = onMarkerSelect;
exports.onNavigatingTo = onNavigatingTo;