/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var http = require('http');
var API_KEY = "AIzaSyAJsjpzjoI4d7QIm9fNse2-IUXrhhe2_Ys";
var polyline = require('nativescript-google-maps-sdk').Polyline;
var Color = require("color").Color;
var polylineParser = require('polyline');

function ParseDirections(Source, Destination, module, fll) {
    var API_URL = "https://maps.googleapis.com/maps/api/directions/json?";
    API_URL += "&origin=place_id:" + Source;
    API_URL += "&key=" + API_KEY;
    API_URL += "&destination=place_id:" + Destination;
    API_URL += "&waypoints=place_id:" + Destination;
    console.log(API_URL);
    http.getJSON(API_URL).then(function (data) {
        fll(data, LegsItrator(data.routes[0],  module),distance(data.routes[0].legs));
    }, function (error) {
        console.log(error);
    });
}
function LegsItrator(Routes, module) {
    try {
        var Routes = Routes;
        var polyline = new module.Polyline();
        polylineParser.decode(Routes.overview_polyline.points).forEach(function (latlng) {
            polyline.addPoint(module.Position.positionFromLatLng(latlng[0], latlng[1]))
        });
        polyline.visible = true;
        polyline.width = 11;
        polyline.color = new Color('#dd4949');
        polyline.geodesic = true;
        console.log("POLY");
        console.log(JSON.stringify(polyline));

        return polyline; 

    } catch (err) {
        console.log(err);
    }


}
function distance(legs) {
    var distance = 0;
    legs.forEach(function (data) {
        distance = data.distance.value + distance;
    });
    return Math.round(distance/1000);
}

exports.Parse = ParseDirections;
 