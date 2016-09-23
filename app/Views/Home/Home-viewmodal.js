/**
 * Created by Sarath Kumar on 9/7/2016.
 */

var Observable = require("data/observable").Observable;
var frame = require('ui/frame');
var PickerManager = require("nativescript-timedatepicker");
var LocationSearch = "/Views/LocationSearch/Search-Page";
var fullscreen_modal = false;
var moment = require('moment');
var http = require('http');
var frame = require('ui/frame');
var applicationSettings = require('application-settings');
var imagepickerModule = require("nativescript-imagepicker");
var icModule = require("nativescript-imagecropper");
var image = require("image-source");
var permissions = require('nativescript-permissions');
var loader = require('../../Utils/Utility').Loader;
var Loader;
var viewModel;
function createViewModel(page) {
    Loader = new loader("Updating...");
    viewModel = new Observable();
    if (page.navigationContext) {
        viewModel.user = page.navigationContext
        viewModel.user.profile_pic = applicationSettings.getString('server') + '/' + viewModel.user.profile_pic;
    } else {
        getUser(function (user) {
            user.profile_pic = applicationSettings.getString('server') + '/' + user.profile_pic;
            viewModel.set('user', user);
        })
    }
    var topmost = frame.topmost();
    var dateView = page.getViewById("dateGrid");
    dateView.visibility = "collapsed";
    viewModel.RideInfo = new Observable({
        source: "Choose",
        source_id: "",
        source_latlng: {},
        destination: "Choose",
        destination_id: "",
        destination_latlng: {},
        waypoints: [],
        waypoints_latlng: [],
        Date: "dd-mm-yyyy",
        travel_date_time: null
    });
    viewModel.AddSource = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                viewModel.RideInfo.source = data.placename;
                viewModel.RideInfo.source_id = data.place_id;
                viewModel.RideInfo.source_latlng = data.place_id_lat_lng;
                if (viewModel.RideInfo.destination != "Choose") {
                    dateView.visibility = "visible"
                }

            }
        }, fullscreen_modal);

    };
    viewModel.AddDestination = function () {
        page.showModal(LocationSearch, {}, function closeCallback(data) {
            if (data) {
                viewModel.RideInfo.destination = data.placename;
                viewModel.RideInfo.destination_id = data.place_id;
                viewModel.RideInfo.destination_latlng = data.place_id_lat_lng;
                if (viewModel.RideInfo.source != "Choose") {
                    dateView.visibility = "visible"
                }
                console.log(JSON.stringify(viewModel.Location));
            }
        }, fullscreen_modal);


    };
    viewModel.OpendatePicker = function () {

        PickerManager.init(function (date) {
            if (date) {
                var timestamp = new moment(date, "DD MM YYYY HH:mm z");
                var SelectedDate = new Date(timestamp);
                var momentIns = new moment(SelectedDate);
                viewModel.RideInfo.set('Date', momentIns.format("LL"));
                viewModel.RideInfo.set('travel_date_time', timestamp);
            }

        }, null, null, "Apply", "NotApply");

        PickerManager.showDatePickerDialog();
    };
    viewModel.findRide = function () {
        var navigationEntry = {
            moduleName: '/Views/Find-Ride/Find-Ride',
            backstackVisible: true,
            clearHistory: false,
            context: viewModel.RideInfo,
        };
        topmost.transition = {name: "slideRight"};
        topmost.navigate(navigationEntry);
    };
    viewModel.offerRide = function () {
        var navigationEntry = {
            backstackVisible: true,
            clearHistory: false,
            moduleName: '/Views/Offer-Ride/Offer-Ride',
            context: viewModel.RideInfo
        };
        topmost.transition = {name: "slideLeft"};

        topmost.navigate(navigationEntry);
    };
    viewModel.openEditAccount = function () {
        var navigationEntry = {
            backstackVisible: true,
            moduleName: '/Views/BasicInfo/Basic-Info',
            context: viewModel.user
        };
        topmost.transition = {name: "slideLeft"};

        topmost.navigate(navigationEntry);
    };
    viewModel.updatePic = function () {
        permissions.requestPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE, "Acaps Require External storage Access")
            .then(function () {
                var context = imagepickerModule.create({
                    mode: "single"
                });
                startSelection(context);
            })
            .catch(function () {
                alert('Acaps Require External storage Access .please grant necessary permission')
            });
    };
    viewModel.carmanage = function () {
        var navigationEntry = {
            moduleName: "/Views/Add-Car/AddCar",
            backstackVisible: true,
            clearHistory: false,
            context: viewModel.RideInfo,
        };
        topmost.transition = {name: "slideRight"};
        topmost.navigate(navigationEntry);

    }
    return viewModel;

}
function getUser(callme) {
    Loader.show();
    http.request({
        url: applicationSettings.getString("server") + "/api/user",
        method: "GET",
        headers: {
            "x-acaps-key": applicationSettings.getString("s_key")
        }
    }).then(function (response) {
            Loader.hide();
            if (response.statusCode == 401) {
                frame.topmost().transition = {name: "fade"};
                var navigationEntry = {
                    moduleName: '/Views/Login/Login-page',
                    clearHistory: true
                };
                frame.topmost().navigate(navigationEntry);
                return;
            }
            var data = JSON.parse(response.content);
            if (data) {
                callme(data);
            }
        }
        ,
        function (e) {
            Loader.hide();

        }
    )
    ;
}

function startSelection(context) {
    context
        .authorize()
        .then(function () {

            return context.present();
        })
        .then(function (selection) {
            selection.forEach(function (selected) {
                console.log("uri: " + selected.uri);
                console.log("fileUri: " + selected.fileUri);
                var cropper = new icModule.ImageCropper();
                var im = new image.ImageSource();
                im.loadFromFile(selected.fileUri);
                try {
                    cropper.show(im, {width: 120, height: 120}).then(function (args) {
                        console.log(JSON.stringify(args));
                        uploadImage(args.image.toBase64String());
                    })
                        .catch(function (e) {
                            console.log(e);
                        });
                } catch (f) {
                    console.log(f);
                }
            });
        }).catch(function (e) {
        console.log(e);
    });
}

function uploadImage(bs64) {
    Loader.show();
    http.request({
        url: applicationSettings.getString("server") + "/api/upload/user",
        method: "POST",
        headers: {
            "x-acaps-key": applicationSettings.getString("s_key"),
            "Content-Type": "application/json"
        },
        content: JSON.stringify({b64: bs64})
    }).then(function (response) {
            Loader.hide();
            console.log(response);
            var res = JSON.parse(response.content);
            if (res.status == true) {
                alert("Profile Picture Updated");
                getUser(function (user) {
                    user.profile_pic = applicationSettings.getString('server') + '/' + user.profile_pic;
                    viewModel.set('user', user);
                })
            } else {
                alert("Server error try again later");

            }

        }
        ,
        function (e) {
            Loader.hide();

            alert("Connection error try again later");
            console.log(e);
        }
    )
    ;
}

exports.createViewModel = createViewModel;