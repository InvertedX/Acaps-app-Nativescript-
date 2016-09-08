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
    API_URL += "&origin=" + Source;
    API_URL += "&key=" + API_KEY;
    API_URL += "&destination=" + Destination;
    API_URL += "&waypoints=" + "mysuru";
    console.log(API_URL);
    http.getJSON(API_URL).then(function (data) {
        fll(data, LegsItrator(data.routes[0], module));
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

        /*
         return new Promise(function (resolve, reject) {
         var steps = [];
         console.log("promise");

         });
         */


    } catch (err) {
        console.log(err);
    }


}

exports.Parse = ParseDirections;
 