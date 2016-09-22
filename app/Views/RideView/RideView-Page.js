/**
 * Created by Sarath Kumar on 9/21/2016.
 */

var application = require("application");

var Observable = require("data/observable").Observable;

var DirectionParser = require('../../Utils/DirectionApiParser').Parse;

var mapView, Map_args, context, viewModel, page, mapProgress;
var index = 0;
var mapsModule = require("nativescript-google-maps-sdk");
var moment = require("moment");
var http = require("http");
var phone = require("nativescript-phone");
var loader = require('../../Utils/Utility').Loader;
var applicationSettings = require("application-settings");
var loadingDialogue;
var Utility = require('../../Utils/Utility').Util();
var button;
var SnackBar = require("nativescript-snackbar").SnackBar;

function onNavigatingTo(args) {
    page = args.object;
    SnackBar = new SnackBar();
    loadingDialogue = new loader("Loading...");
    page.cssFile = "RideView-Page.css";
    button = page.getViewById("requestRide");
    mapProgress = page.getViewById('mapProgreess');
    viewModel = new Observable();
    viewModel.RideInfo = page.navigationContext;
    var RideVenue = new Date(viewModel.RideInfo.travel_date_time);
    var momentIns = new moment(RideVenue);
    viewModel.day = momentIns.format("dddd, MMMM Do YYYY");
    viewModel.time = momentIns.format("h:mm a");
    var server = Utility.getServer();
    try {
        loadingDialogue.show();
        console.log("START");
        http.request({
            url: server + '/api/ridestatus',
            method: "POST",
            headers: {"Content-Type": "application/json", "x-acaps-key": applicationSettings.getString("s_key")},
            content: JSON.stringify({ride_id: viewModel.RideInfo.id})
        }).then(function (response) {
            loadingDialogue.hide();
            if (response.statusCode == 401) {
                console.log(401);
            } else if (response.statusCode == 200) {

                var Content = JSON.parse(response.content);

                if (Content.state == 'REQUEST_WAITING') {
                    button.visibility = "hidden";
                    snackbar.simple('Your ride request submitted for approval').then(function () {

                    });
                }
                if (Content.state == 'REQUEST_ACCEPTED') {
                    button.visibility = "hidden";
                    snackbar.simple('Your ride request approved').then(function () {

                    });
                }

            }
        }, function (err) {
            loadingDialogue.hide();
            alert("Acaps encountered an error trying to connect to the server.please try again");
        });

    } catch (er) {
        console.error(er);
    }


    viewModel.requestRide = function () {
        loadingDialogue.show();
        http.request({
            url: server + '/api/requestride',
            method: "POST",
            headers: {"Content-Type": "application/json", "x-acaps-key": applicationSettings.getString("s_key")},
            content: JSON.stringify({ride_id: viewModel.RideInfo.id})
        }).then(function (response) {
            loadingDialogue.hide();
            if (response.statusCode == 401) {
                console.log(401);
            } else if (response.statusCode == 200) {
                var Content = JSON.parse(response.content);
                if (Content.state == "ALREADY_REQUESTED") {
                    alert("you already requested for this ride");

                } else if (Content.state == "REQUESTED") {
                    alert("Your request has been sent ");
                }
                if (Content.state == "ERROR") {
                    alert("Something happened please try later");
                }

            }
        }, function (err) {
            loadingDialogue.hide();
            alert("Acaps encountered an error trying to connect to the server.please try again");
        });


    };

    viewModel.call = function () {
        phone.dial(viewModel.RideInfo.user.phone, true);
    };


    if (viewModel.RideInfo.Rate == 0) {
        viewModel.RideInfo.Rate = "Free";
    } else {
        viewModel.RideInfo.Rate = "₹" + " " + viewModel.RideInfo.Rate
    }
    page.bindingContext = viewModel;

}

function onMapReady(args) {
    console.log("MAP Ready")
    Map_args = args;
    mapView = args.object;
    function setUpmarkers() {
        new Promise(function () {
            try {

                var markerSource = new mapsModule.Marker();
                markerSource.position = mapsModule.Position
                    .positionFromLatLng(viewModel.RideInfo.source_latlng.lat, viewModel.RideInfo.source_latlng.lng);
                markerSource.title = viewModel.RideInfo.source;
                markerSource.snippet = "India";
                markerSource.userData = {index: index};
                index++;
                mapView.addMarker(markerSource);
                var markerDestination = new mapsModule.Marker();
                markerDestination.position = mapsModule.Position.positionFromLatLng(viewModel.RideInfo.destination_latlng.lat, viewModel.RideInfo.destination_latlng.lng);
                markerDestination.title = viewModel.RideInfo.destination;
                markerDestination.snippet = "India";
                markerDestination.userData = {index: index};
                index++;
                mapView.addMarker(markerDestination);

                for (var i = 0; i < viewModel.RideInfo.waypoints_latlng.length; i++) {
                    console.log("SD", viewModel.RideInfo.waypoints[i]);
                    var markerWaypoints = new mapsModule.Marker();
                    markerWaypoints.position = mapsModule.Position.positionFromLatLng(viewModel.RideInfo.waypoints_latlng[i].lat, viewModel.RideInfo.waypoints_latlng[i].lng);
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
        })
            .then(function () {

            });
    }

    setUpmarkers();


}
function RouteFind() {
    new Promise(function () {
        DirectionParser(viewModel.RideInfo.source_id, viewModel.RideInfo.waypoints_id, viewModel.RideInfo.destination_id, mapsModule, function (data, poly, distance, order) {
            try {
                console.log("Waypoint Order ", JSON.stringify(viewModel.WayPoints));
                console.log("Waypoint Order ", JSON.stringify(order));
            } catch (er) {
                console.log(er);
            }

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

    }).then(function () {
        console.log("Route found")
    });


}

exports.onMapReady = onMapReady;
exports.onNavigatingTo = onNavigatingTo;