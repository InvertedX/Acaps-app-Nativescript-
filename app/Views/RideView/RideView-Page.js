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
var dialoge = require('ui/dialogs');
var button, reqStatus;
var SnackBarModule = require("nativescript-snackbar");
var tabViewModule = require("ui/tab-view");
var stackLayoutModule = require("ui/layouts/stack-layout");
var label = require("ui/label");
var server = require('../../Utils/Const').SERVER;
var tabview, tabRequestButton, statusIcon, status;
var SnackBar, ownride, elsesride;
var requests, Loader;
function onNavigatingTo(args) {
    page = args.object;
    SnackBar = new SnackBarModule.SnackBar();
    loadingDialogue = new loader("Loading...");
    page.cssFile = "RideView-Page.css";
    button = page.getViewById("requestRide");
    statusIcon = page.getViewById("statusIcon");
    tabRequestButton = page.getViewById("tabRequestButton");
    tabview = page.getViewById("tabview");
    ownride = page.getViewById('ownride');
    ownride.visibility = "collapsed"
    elsesride = page.getViewById('elsesride');
    elsesride.visibility = "collapsed"
    status = page.getViewById("status");
    status.visibility = "collapsed";
    tabRequestButton.visibility = "collapsed";
    statusIcon.visibility = "collapsed";
    mapProgress = page.getViewById('mapProgreess');
    viewModel = new Observable();
    viewModel.RideInfo = page.navigationContext;
    var userId = applicationSettings.getNumber('u');
    if (userId == viewModel.RideInfo.user.id) {
        tabRequestButton.visibility = "collapsed";
        button.visibility = "collapsed";
        getRequesters();
        ownride.visibility = "visible";
    } else {
        elsesride.visibility = "visible";
        checkRequestStatus();
    }

    var RideVenue = new Date(viewModel.RideInfo.travel_date_time);
    var momentIns = new moment(RideVenue);
    viewModel.day = momentIns.format("dddd, MMMM Do YYYY");
    viewModel.time = momentIns.format("h:mm a");
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

function getRequesters() {
    loadingDialogue.show();
    console.log("RIDE REQUESTERES");
    http.request({
        url: server + '/api/riderequesters',
        method: "POST",
        headers: {"Content-Type": "application/json", "x-acaps-key": applicationSettings.getString("s_key")},
        content: JSON.stringify({ride_id: viewModel.RideInfo.id})
    }).then(function (response) {
        requests = JSON.parse(response.content);
        ownride.items = requests;
        loadingDialogue.hide();

    }, function (err) {
        loadingDialogue.hide();

        console.log(err);
    });
}
function checkRequestStatus() {
    try {
        loadingDialogue.show();
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
                        tabRequestButton.visibility = "collapsed";
                        button.visibility = "collapsed";
                        status.visibility = "visible";
                        statusIcon.visibility = "visible";
                        statusIcon.text = '\ue88c';
                        status.text = "Your ride request submitted for approval";
                        statusIcon.color = "#95a5a6";
                        SnackBar.simple('Your ride request submitted for approval').then(function () {
                        });
                        try {
                            console.log(tabview.selectedIndex)
                            tabview.selectedIndex = 3
                        } catch (er) {
                            console.log(er);
                        }
                    }
                    if (Content.state == 'REQUEST_ACCEPTED') {
                        tabRequestButton.visibility = "collapsed";
                        button.visibility = "collapsed";
                        status.visibility = "visible";
                        statusIcon.visibility = "visible";
                        statusIcon.text = '\ue86c';
                        status.text = "Your ride request approved";
                        statusIcon.color = "#2ecc71";
                        SnackBar.simple('Your ride request approved').then(function () {
                        });
                        try {
                            console.log(tabview.selectedIndex)
                            tabview.selectedIndex = 3
                        } catch (er) {
                            console.log(er);
                        }
                    }
                    if (Content.state == 'REQUEST_DECLINED') {
                        tabRequestButton.visibility = "collapsed";
                        button.visibility = "collapsed";
                        status.visibility = "visible";
                        statusIcon.visibility = "visible";
                        statusIcon.color = "#e74c3c";
                        statusIcon.text = '\ue888';
                        status.text = "Your ride request declined";
                        SnackBar.simple('Your ride request declined').then(function () {
                        });
                        try {
                            console.log(tabview.selectedIndex)
                            tabview.selectedIndex = 3
                        } catch (er) {
                            console.log(er);
                        }
                    }
                    if (Content.state == 'NOT_REQUESTED') {
                        button.visibility = "visible";
                        tabRequestButton.visibility = "visible";
                        button.visibility = "visible";
                        status.visibility = "collapsed";
                        statusIcon.visibility = "collapsed";
                    }
                }
            }
            ,
            function (err) {
                loadingDialogue.hide();
                alert("Acaps encountered an error trying to connect to the server.please try again");
            }
        );
    } catch (er) {
        console.error(er);
    }
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

exports.acceptReq = function (args) {
    dialoge.confirm("Are Sure to accept request?").then(function (bool) {
        if (bool) {
            var userID = args.object.id;
            loadingDialogue = new loader("Loading...");
            loadingDialogue.show();
            http.request({
                url: server + '/api/rideaccpetdecline',
                method: "POST",
                headers: {"Content-Type": "application/json", "x-acaps-key": applicationSettings.getString("s_key")},
                content: JSON.stringify({ride_id: viewModel.RideInfo.id, user_id: parseInt(userID), accept: 1})
            }).then(function (response) {
                    console.dump(response);
                    loadingDialogue.hide();
                    getRequesters();
                },
                function (err) {
                    loadingDialogue.hide();
                    alert("Acaps encountered an error trying to connect to the server.please try again");
                }
            );
        }
    })

};

exports.declineReq = function (args) {
    loadingDialogue = new loader("Loading...");
    dialoge.confirm("Are you Sure to decline request?").then(function (bool) {
        if (bool) {
            loadingDialogue.show();
            var userID = args.object.id;
            http.request({
                url: server + '/api/rideaccpetdecline',
                method: "POST",
                headers: {"Content-Type": "application/json", "x-acaps-key": applicationSettings.getString("s_key")},
                content: JSON.stringify({ride_id: viewModel.RideInfo.id, user_id: parseInt(userID), accept: 2})
            }).then(function (response) {
                    console.dump(response);
                    loadingDialogue.hide();
                    getRequesters();
                },
                function (err) {
                    loadingDialogue.hide();
                    alert("Acaps encountered an error trying to connect to the server.please try again");
                }
            );
        }
    });


};

exports.onNavigatingTo = onNavigatingTo;