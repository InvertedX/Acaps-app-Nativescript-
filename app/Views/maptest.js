/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var mapsModule = require("nativescript-google-maps-sdk");
var Color = require("color").Color;
var DirectionParser = require("./DirectionApiParser").Parse;
var Observable = require("data/observable").Observable;
var viewModel = new Observable()
function navready(args) {
    var page = args.object;
    viewModel.latitude = 6;
    viewModel.zoom = 9;
    viewModel.longitude = 60;
    page.bindingContext = viewModel;
}

function onMapReady(args) {
    var mapView = args.object;
    console.log("Setting a marker...");


    DirectionParser("kayamkulam", "kochi", mapsModule, function (data, poly) {
        console.log(poly);

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
            var zoomLevel = 21;
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

function onMarkerSelect(args) {
    console.log("Clicked on " + args.marker.title);
}

function onCameraChanged(args) {
    console.log("Camera changed: " + JSON.stringify(args.camera));
}

exports.onMapReady = onMapReady;
exports.navready = navready;
exports.onMarkerSelect = onMarkerSelect;
exports.onCameraChanged = onCameraChanged;