/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var buttonModule = require('ui/button');
var application = require("application");
var Observable = require("data/observable").Observable;
var index = 1;
var source_lat_lng, destination_lat_lng;
var DirectionParser = require('./DirectionApiParser').Parse;
var mapView;
var context = null;
var mapsModule = require("nativescript-google-maps-sdk");
var viewModel = null;
var moment = require('moment');
var PickerManager = require("nativescript-timedatepicker");

function onNavigatingTo(args) {
    var page = args.object;
    if (page.navigationContext) {
        context = page.navigationContext;
        console.log(JSON.stringify(context));
    }
    page.cssFile = "Offer-Ride.css";
    viewModel = new Observable();
    viewModel.RideInfo = context;
    viewModel.RideInfo.Time = "12:00 pm";
    viewModel.latitude = 6;
    viewModel.zoom = 9;
    viewModel.longitude = 60;
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

        }, "",SelectedDate);
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
    
    
    page.bindingContext = viewModel;


}

function onMapReady(args) {
    console.log("MAP Ready")
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

        RouteFind();
    } catch (er) {
        console.error(er);
    }


}

function onMarkerSelect(args) {
    console.log("Clicked on " + args.marker.title);
}


function RouteFind() {
    DirectionParser(viewModel.RideInfo.source_id, viewModel.RideInfo.destination_id, mapsModule, function (data, poly, distance) {

        console.log("DISTACNE ", distance);
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

        console.log(avglat);
        console.log(avglng);
        console.log(zoomLevel);
        console.log("HEERE1");
        viewModel.set("zoom", zoomLevel);
        viewModel.set("latitude", avglat);
        viewModel.set("longitude", avglng);

    })

}

function onCameraChanged(args) {
    console.log("Camera changed: " + JSON.stringify(args.camera));
}

exports.onMapReady = onMapReady;
exports.onMarkerSelect = onMarkerSelect;
exports.onCameraChanged = onCameraChanged;
exports.onNavigatingTo = onNavigatingTo;