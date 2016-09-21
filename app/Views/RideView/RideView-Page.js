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
var phone = require( "nativescript-phone" );


function onNavigatingTo(args) {
    page = args.object;

    page.cssFile = "RideView-Page.css";
    if (page.navigationContext) {
        context = page.navigationContext;
    }
    mapProgress = page.getViewById('mapProgreess');

    viewModel = new Observable();

    viewModel.RideInfo = {
        "id": 3,
        "source": "Kottayam",
        "source_id": "ChIJX0NrbKErBjsRbtCNj_YCK74",
        "source_latlng": "{\"lat\":9.591566799999999,\"lng\":76.5221531}",
        "destination": "Kochi",
        "destination_id": "ChIJv8a-SlENCDsRkkGEpcqC1Qs",
        "destination_latlng": "{\"lat\":9.9312328,\"lng\":76.26730409999999}",
        "waypoints": "[\"Kayamkulam\"]",
        "waypoints_id": "[\"ChIJ8zL7nVQcBjsRPbal1PT5xTw\"]",
        "waypoints_latlng": "[{\"lat\":9.184365899999998,\"lng\":76.51515599999999}]",
        "travel_date_time": "2017-09-19T18:30:00.000Z",
        "seats": 1,
        "description": "Lorem Ipsum is simply dummy text of the printing and types type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
        "gender_preference": "none",
        "Rate": 33,
        "Phone": 255636,
        "createdAt": "2016-09-20T19:28:40.000Z",
        "updatedAt": "2016-09-20T19:28:40.000Z",
        "userId": 2,
        "carId": 1,
        "user": {
            "id": 2,
            "Activated": true,
            "name": "Rob Stark",
            "gender": "NULL",
            "dob": null,
            "email": "rob@stark.com",
            "Department": "Faculty",
            "type": "faculty",
            "phone": "255636",
            "profile_pic": "http://192.168.1.102:2016/default",
            "createdAt": "2016-09-18T11:26:23.000Z",
            "updatedAt": "2016-09-18T11:26:23.000Z"
        },
        "car": {
            "id": 1,
            "model": "Figo",
            "manufacturer": "Ford",
            "regnumber": "KL 10 11562",
            "photo": "http://192.168.1.102:2016/01",
            "createdAt": "2016-09-18T00:00:00.000Z",
            "updatedAt": "2016-09-18T00:00:00.000Z",
            "userId": 2
        }
    };

    var RideVenue = new Date(viewModel.RideInfo.travel_date_time);
    var momentIns = new moment(RideVenue);
    viewModel.day = momentIns.format("dddd, MMMM Do YYYY");
    viewModel.time = momentIns.format("h:mm a");
    console.log(viewModel.time);
    viewModel.requestRide = function () {
      alert("Req");
    };

    viewModel.call = function () {
        phone.dial(viewModel.RideInfo.user.phone,true);
    };
    viewModel.RideInfo.waypoints = JSON.parse(viewModel.RideInfo.waypoints);
    viewModel.RideInfo.source_latlng = JSON.parse(viewModel.RideInfo.source_latlng);
    viewModel.RideInfo.destination_latlng = JSON.parse(viewModel.RideInfo.destination_latlng);
    viewModel.RideInfo.waypoints_latlng = JSON.parse(viewModel.RideInfo.waypoints_latlng);
    viewModel.RideInfo.waypoints_id = JSON.parse(viewModel.RideInfo.waypoints_id);

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