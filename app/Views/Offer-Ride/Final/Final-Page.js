/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var buttonModule = require('ui/button');
var application = require("application");
var ViewModel = require("./Final-Page-VM").createViewModel;
var mapsModule = require("nativescript-google-maps-sdk");
var platform = require("platform");
var viewModel;
var index = 1;
var source_lat_lng, destination_lat_lng;
var DirectionParser = require('../DirectionApiParser').Parse;
var mapView;
function onNavigatingTo(args) {
    var page = args.object;
    viewModel = ViewModel(page.navigationContext);
    page.bindingContext = viewModel;
}

function onMapReady(args) {
    console.log("MAP Ready")
    mapView = args.object;
    try {
        source_lat_lng = viewModel.rideData.source_lat_lng;
        var markerSource = new mapsModule.Marker();
        markerSource.position = mapsModule.Position.positionFromLatLng(source_lat_lng.lat, source_lat_lng.lng);
        markerSource.title = viewModel.rideData.source;
        markerSource.snippet = "India";
        markerSource.userData = {index: index};
        index++;
        mapView.addMarker(markerSource);

        destination_lat_lng = viewModel.rideData.destination_lat_lng;
        var markerDestination = new mapsModule.Marker();
        markerDestination.position = mapsModule.Position.positionFromLatLng(destination_lat_lng.lat, destination_lat_lng.lng);
        markerDestination.title = viewModel.rideData.destination;
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
    DirectionParser(viewModel.rideData.source_id, viewModel.rideData.destination_id, mapsModule, function (data, poly, distance) {

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

function onCameraChanged(args) {
    console.log("Camera changed: " + JSON.stringify(args.camera));
}

exports.onNavigatingTo = onNavigatingTo;
exports.onMapReady = onMapReady;
exports.onMarkerSelect = onMarkerSelect;
exports.onCameraChanged = onCameraChanged;