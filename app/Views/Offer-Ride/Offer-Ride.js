/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var application = require("application");
var Observable = require("data/observable").Observable;
var frame = require("ui/frame");
var ObservableArray = require("data/observable-array").ObservableArray;
var index = 1;
var source_latlng, destination_latlng;
var DirectionParser = require('../../Utils/DirectionApiParser').Parse;
var dialogs = require('ui/dialogs');
var mapView;
var context = null;
var mapsModule = require("nativescript-google-maps-sdk");
var viewModel = null;
var moment = require('moment');
var CalculateFare = require('../../Utils/Utility').PriceCalculate;
var PickerManager = require("nativescript-timedatepicker");
var mDistance = 1;
var genders = ['none', 'male', 'female'];
var LocationSearch = "/Views/LocationSearch/Search-Page";
var fullscreen_modal = false;
var Map_args = null;
var mapProgress, tabView, CarSetupMsg, listwaypoints, carSelector;
var http = require('http');
var appSetting = require('application-settings');
var loader = require('../../Utils/Utility').Loader;
var Server = require("../../Utils/Const").SERVER;
exports.SERVER = Server;
var cars;
var cars_empty = false;


function onNavigatingTo(args) {
    var page = args.object;
    if (page.navigationContext) {
        context = page.navigationContext;
    }
    page.cssFile = "Offer-Ride.css";
    viewModel = new Observable();
    listwaypoints = page.getViewById("listwaypoints");
    var genderpicker = page.getViewById("GenderPicker");
    mapProgress = page.getViewById("mapProgreess");
    carSelector = page.getViewById("carSelect")
    CarSetupMsg = page.getViewById("CarSetupMsg")
    CarSetupMsg.visibility = "collapsed";
    GetCars();
    tabView = page.getViewById("tabView");
    mapProgress.visibility = "collapsed";
    genderpicker.items = genders;
    viewModel.RideInfo = context;
    viewModel.index = 0;
    viewModel.carindex = 0;
    viewModel.Selected = context;
    viewModel.fareSelectorVisibilty = "visible";
    viewModel.RideInfo.freeride = false;
    viewModel.RideInfo.waypoints = [];
    viewModel.RideInfo.waypoints_id = [];
    viewModel.RideInfo.waypoints_latlng = [];
    viewModel.changeToFree = function () {
        if (viewModel.RideInfo.freeride == true) {
            viewModel.set('fareSelectorVisibilty', "visible");
            viewModel.RideInfo.gender_preference = genders[viewModel.index];

        } else {
            viewModel.set('fareSelectorVisibilty', "collapsed");
            viewModel.RideInfo.gender_preference = genders[viewModel.index];
        }
    };
    viewModel.RideInfo.gender_preference = genders[viewModel.index];
    viewModel.RideInfo.seats = 1;
    viewModel.RideInfo.description = "";
    viewModel.RideInfo.Time = "12:00 pm";
    viewModel.RideInfo.price = 0;
    viewModel.MaxPrice = 0;
    viewModel.MinPrice = 0;
    viewModel.latitude = 6;
    viewModel.zoom = 9;
    viewModel.longitude = 60;
    viewModel.AddSource = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                clearMap();
                viewModel.RideInfo.source = data.placename;
                viewModel.RideInfo.source_id = data.place_id;
                viewModel.RideInfo.source_latlng = data.place_id_lat_lng;
                onMapReady(Map_args);
            }
        }, fullscreen_modal);

    };
    viewModel.AddDestination = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                clearMap();
                viewModel.RideInfo.destination = data.placename;
                viewModel.RideInfo.destination_id = data.place_id;
                viewModel.RideInfo.destination_latlng = data.place_id_lat_lng;
                onMapReady(Map_args);

            }
        }, fullscreen_modal);


    };
    viewModel.addCar = function () {
        var navigationEntry = {
            backstackVisible: true,
            clearHistory: false,
            moduleName: '/Views/CarManage/CarManage-page',
            context: viewModel.RideInfo
        };
        frame.topmost().transition = {name: "slideLeft"};

        frame.topmost().navigate(navigationEntry);
    };
    viewModel.seatsManage = {
        Add: function () {
            if (viewModel.RideInfo.seats < 12) {
                viewModel.RideInfo.set("seats", viewModel.RideInfo.seats + 1);
                console.log("add" + viewModel.RideInfo.seats);
                FareManage(mDistance)
            }
        },
        Sub: function () {
            if (viewModel.RideInfo.seats > 1) {
                console.log("sUB");
                viewModel.RideInfo.set("seats", viewModel.RideInfo.seats - 1);
                FareManage(mDistance);

            }
        }
    };
    viewModel.addWaypont = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                viewModel.RideInfo.waypoints.push(data.placename);
                viewModel.RideInfo.waypoints_id.push(data.place_id);
                viewModel.RideInfo.waypoints_latlng.push(data.place_id_lat_lng);
                viewModel.WayPoints.setItem(viewModel.WayPoints.length++, {location: data.placename})
                console.log("SDDD", listwaypoints.height + 50);
                listwaypoints.height = listwaypoints.height + 50;
                clearMap();
                onMapReady(Map_args);

            }
        }, fullscreen_modal);
    };
    viewModel.WayPoints = new ObservableArray();
    viewModel.TimePicker = function () {
        var SelectedDate = new Date(viewModel.RideInfo.travel_date_time);
        PickerManager.init(function (Time) {
            if (Time) {
                var timestamp = new moment(Time, "DD MM YYYY HH:mm z");
                var SelectedDate = new Date(timestamp);
                var momentIns = new moment(SelectedDate);
                viewModel.RideInfo.set('Time', momentIns.format("hh:mm a"));
                viewModel.RideInfo.set('Date', momentIns.format("LL"));
                viewModel.RideInfo.set('travel_date_time', timestamp);
            }

        }, "", SelectedDate);
        PickerManager.showTimePickerDialog();

    };
    viewModel.OpendatePicker = function () {
        var SelectedDate = new Date(viewModel.RideInfo.travel_date_time);
        console.log(SelectedDate);
        console.log(viewModel.RideInfo.travel_date_time);
        if (viewModel.RideInfo.travel_date_time == undefined) {
            SelectedDate = new Date();
        }
        PickerManager.init(function (date) {
            if (date) {
                console.log(date);
                var timestamp = new moment(date, "DD MM YYYY HH:mm z");
                var SelectedDate = new Date(timestamp);
                var momentIns = new moment(SelectedDate);
                viewModel.RideInfo.set('Date', momentIns.format("LL"));
                viewModel.RideInfo.set('Time', momentIns.format("hh:mm a"));
                viewModel.RideInfo.set('travel_date_time', timestamp);
            }

        }, "Select Date", SelectedDate);

        PickerManager.showDatePickerDialog();
    };
    viewModel.next = function () {
        tabView.selectedIndex = 1;
    };
    viewModel.finish = function () {

        if (viewModel.RideInfo.source == "Choose") {
            alert("Source Field is required")
            return;
        }
        if (viewModel.RideInfo.destination == "Choose") {
            alert("Destination Field is required")
            return;
        }
        if (viewModel.RideInfo.description == "Choose") {
            alert("Destination Field is required")
            return;
        }
        try {
            viewModel.RideInfo.carId = cars[viewModel.carindex].id;

        } catch (er) {
            alert("Please select a car before Submit");
            return;

        } 

        viewModel.RideInfo.description = viewModel.RideInfo.description.trim();
        if (viewModel.RideInfo.description.length == 0) {
            console.log(viewModel.RideInfo.description);
            alert("Description is required");
            return;
        }
        if (cars_empty == true) {
            viewModel.RideInfo.carId = cars[viewModel.carindex].id;
        }

        var finishLoader = loader("Loading...");
        finishLoader.show();
        http.request({
            url: appSetting.getString("server") + "/api/offer",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-acaps-key": appSetting.getString("s_key")
            },
            content: JSON.stringify(viewModel.RideInfo)
        }).then(function (response) {
            finishLoader.hide();
            var navigationEntry = {
                backstackVisible: true,
                moduleName: '/Views/Ride-Lists/Ride-Lists',
                context: {restrict: "OFFERED_RIDES"}
            };
            frame.topmost().transition = {name: "slideLeft"};
            frame.topmost().navigate(navigationEntry);
            
         }, function (e) {
            finishLoader.hide();
            console.error(e);
        });


    };
    viewModel.GenderPref = function (args) {
        setTimeout(function () {
            viewModel.RideInfo.set("gender_preference", args.object.id);
            console.log(args.object.id);
        }, 100);

    };
    page.bindingContext = viewModel;
}
function GetCars() {
    http.request({
        url: appSetting.getString("server") + "/api/cars",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-acaps-key": appSetting.getString("s_key")
        },
        content: JSON.stringify(viewModel.RideInfo)
    }).then(function (response) {
        response.content = JSON.parse(response.content);
        if (response.content.length != 0) {
            cars = response.content;
            var item = cars.map(function (item) {
                return "Model : " + item.model + " ," + item.regnumber;
            });
            console.log(JSON.stringify(cars));
            CarSetupMsg.visibility = "collapsed"
            carSelector.items = item;
        } else {
            CarSetupMsg.visibility = "visible"
            carSelector.visibility = "collapsed"
        }
    }, function (e) {
        console.error(e);
        alert("Error while retrieving data from server")
    });

}

exports.deleteWaypoints = function (args) {
    var index = viewModel.RideInfo.waypoints.indexOf(args.object.id);
    var options = {
        title: "Delete Waypoints",
        message: "Are you sure you want to Delete Waypoint " + viewModel.RideInfo.waypoints[index] + " ?",
        okButtonText: "Yes",
        cancelButtonText: "No",
        neutralButtonText: "Cancel"
    };
    dialogs.confirm(options).then(function (result) {
        if (result == true) {
            viewModel.RideInfo.waypoints.splice(index, 1);
            viewModel.RideInfo.waypoints_latlng.splice(index, 1);
            viewModel.RideInfo.waypoints_id.splice(index, 1);
            viewModel.WayPoints.splice(index, 1);
            listwaypoints.height = listwaypoints.height - 50;
            clearMap();
            onMapReady(Map_args);
        }
    });
    console.log(index);
};

function clearMap() {
    try {
        mapView.removeAllPolylines();
        mapView.removeAllMarkers();
    } catch (Err) {
        console.error(Err);
    }

}

function FareManage(Distance) {
    console.log("CALLED");
    mDistance = Distance;
    var fare = CalculateFare(Distance, 10, viewModel.RideInfo.seats);
    viewModel.set('MaxPrice', fare.maximum);
    viewModel.set('MinPrice', fare.minimum);
    viewModel.RideInfo.set('price', fare.avg)
    console.log(JSON.stringify(fare));
}


function onMapReady(args) {
    console.log("MAP Ready")
    Map_args = args;
    mapView = args.object;
    function setUpmarkers() {
        new Promise(function () {
            try {
                source_latlng = viewModel.RideInfo.source_latlng;
                var markerSource = new mapsModule.Marker();
                markerSource.position = mapsModule.Position.positionFromLatLng(source_latlng.lat, source_latlng.lng);
                markerSource.title = viewModel.RideInfo.source;
                markerSource.snippet = "India";
                markerSource.userData = {index: index};
                index++;
                mapView.addMarker(markerSource);
                destination_latlng = viewModel.RideInfo.destination_latlng;
                var markerDestination = new mapsModule.Marker();
                markerDestination.position = mapsModule.Position.positionFromLatLng(destination_latlng.lat, destination_latlng.lng);
                markerDestination.title = viewModel.RideInfo.destination;
                markerDestination.snippet = "India";
                markerDestination.userData = {index: index};
                index++;
                mapView.addMarker(markerDestination);
                for (var i = 0; i < viewModel.RideInfo.waypoints.length; i++) {
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

function onMarkerSelect(args) {
    console.log("Clicked on " + args.marker.title);
}

function RouteFind() {
    new Promise(function () {
        DirectionParser(viewModel.RideInfo.source_id, viewModel.RideInfo.waypoints_id, viewModel.RideInfo.destination_id, mapsModule, function (data, poly, distance, order) {
            console.log("DISTACNE ", distance);
            try {
                console.log("Waypoint Order ", JSON.stringify(viewModel.WayPoints));
                console.log("Waypoint Order ", JSON.stringify(order));
            } catch (er) {
                console.log(er);
            }
            FareManage(distance);
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

function OrderArray(array, arraymodel) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
        result[i] = array[arraymodel[i]];
    }
    return result;
}


exports.onMapReady = onMapReady;
exports.onMarkerSelect = onMarkerSelect;
exports.onNavigatingTo = onNavigatingTo;