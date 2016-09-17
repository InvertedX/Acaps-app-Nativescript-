/**
 * Created by Sarath Kumar on 9/6/2016.
 */
var application = require("application");
var imageSource = require("image-source");
var http = require("http");
var API_KEY = require("../../Utils/Const").API_KEY;

function placefinder(place, call) {
    var _placesApiUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?'
    _placesApiUrl += "input=" + place;
    _placesApiUrl += "&&key=" + API_KEY;
    _placesApiUrl += "&&components=" + "country:In";
    console.log("URL", _placesApiUrl);
    http.getJSON(_placesApiUrl).then(function (r) {
        console.log(r.status);
        call(r.predictions)
    }, function () {

    });
};
function placeFinder(placeId, callback) {
    var _placesApiUrl = 'https://maps.googleapis.com/maps/api/place/details/json?'
    _placesApiUrl += "placeid=" + placeId;
    _placesApiUrl += "&&key=" + API_KEY;
    _placesApiUrl += "&&components=" + "country:In";
    http.getJSON(_placesApiUrl).then(function (r) {
        var place = {
            place_id : placeId,
            location:r.result.geometry.location,
            short_name:r.result.address_components[0].short_name,
            long_name:r.result.address_components[0].long_name
        };
        callback(place);
    }, function () {

    });
}


exports.find = placefinder;

exports.getplace = placeFinder;