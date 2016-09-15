/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var mapsModule = require("nativescript-google-maps-sdk");
var Color = require("color").Color;
var DirectionParser = require("./Offer-Ride/DirectionApiParser").Parse;
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