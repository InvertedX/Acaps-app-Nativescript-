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
var button, reqStatus;
var SnackBarModule= require("nativescript-snackbar")  ;
var tabViewModule = require("ui/tab-view");
var stackLayoutModule = require("ui/layouts/stack-layout");
var label = require("ui/label");
var tabview, tabRequestButton, statusIcon, status;
var SnackBar;
function onNavigatingTo(args) {
    page = args.object;
    SnackBar = new SnackBarModule.SnackBar();
    loadingDialogue = new loader("Loading...");
    page.cssFile = "RideView-Page.css";
    button = page.getViewById("requestRide");
    statusIcon = page.getViewById("statusIcon");
    tabRequestButton = page.getViewById("tabRequestButton");
    tabview = page.getViewById("tabview");
    status = page.getViewById("status");


    status.visibility = "collapsed";
    tabRequestButton.visibility = "collapsed";
    statusIcon.visibility = "collapsed";


    mapProgress = page.getViewById('mapProgreess');
    viewModel = new Observable();
    viewModel.RideInfo = JSON.parse('{"id":3,"source":"Kottayam","source_id":"ChIJX0NrbKErBjsRbtCNj_YCK74","source_latlng":{"lat":9.591566799999999,"lng":76.5221531},"destination":"Kochi","destination_id":"ChIJv8a-SlENCDsRkkGEpcqC1Qs","destination_latlng":{"lat":9.9312328,"lng":76.26730409999999},"waypoints":["Kayamkulam"],"waypoints_id":["ChIJ8zL7nVQcBjsRPbal1PT5xTw"],"waypoints_latlng":[{"lat":9.184365899999998,"lng":76.51515599999999}],"travel_date_time":"2017-09-19T18:30:00.000Z","seats":1,"description":"hnckckvm","gender_preference":"none","Rate":0,"Phone":255636,"createdAt":"2016-09-20T19:28:40.000Z","updatedAt":"2016-09-20T19:28:40.000Z","userId":2,"carId":1,"user":{"id":2,"Activated":true,"name":"Rob Stark","gender":"NULL","dob":null,"email":"rob@stark.com","Department":"Faculty","type":"faculty","phone":"255636","profile_pic":"http://192.168.1.101:2016/default","createdAt":"2016-09-18T11:26:23.000Z","updatedAt":"2016-09-18T11:26:23.000Z"},"car":{"id":1,"model":"Figo","manufacturer":"Ford","regnumber":"KL 10 11562","photo":"http://192.168.1.101:2016/01","createdAt":"2016-09-18T00:00:00.000Z","updatedAt":"2016-09-18T00:00:00.000Z","userId":2}}');
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
                            console.log( tabview.selectedIndex)
                            tabview.selectedIndex = 3

                        }catch (er){
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
                            console.log( tabview.selectedIndex)
                            tabview.selectedIndex = 3

                        }catch (er){
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
                            console.log( tabview.selectedIndex)
                            tabview.selectedIndex = 3

                        }catch (er){
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