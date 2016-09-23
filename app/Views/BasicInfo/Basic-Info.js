/**
 * Created by Sarath Kumar on 9/23/2016.
 */
var buttonModule = require('ui/button');
var application = require("application");
var observable = require("data/observable").Observable;
var PickerManager = require("nativescript-timedatepicker");
var moment = require("moment");
var appSetting = require("application-settings");
var loader = require('../../Utils/Utility').Loader;
var http = require('http');
var frame = require('ui/frame');
var DateStamp;
var imagepickerModule = require("nativescript-imagepicker");
var icModule = require("nativescript-imagecropper");
var image = require("image-source");
var cameraModule = require("camera");
var applicationSettings = require('application-settings');
var viewModel;
var profile_pic;
var loadermodule = require('../../Utils/Utility').Loader;
var Loaddialog;
function onNavigatingTo(args) {

    var page = args.object;
    page.cssFile = "Account-page.css";
      Loaddialog = loader("Updating..");
    viewModel = new observable();
    viewModel.dob = "";
    viewModel.user = page.navigationContext;
    profile_pic = page.getViewById('pro_pic')
    viewModel.clicktoEdit = function () {

        var permissions = require('nativescript-permissions');

        // cameraModule.takePicture({width: 300, height: 300, keepAspectRatio: true})
        //     .then(function (picture) {
        //         console.log(JSON.stringify(picture));
        //         var cropper = new icModule.ImageCropper();
        //         cropper.show(picture, {width: 100, height: 100}).then(function (args) {
        //             console.log(JSON.stringify(args));
        //             if (args.image !== null) {
        //                 console.log(JSON.stringify(args));
        //             }
        //             else {
        //             }
        //         }).catch(function (e) {
        //             console.log(e);
        //         });
        //     }).catch(function (e) {
        //     console.log(e);
        // })

        permissions.requestPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE, "I need these permissions because I'm cool")
            .then(function () {
                var context = imagepickerModule.create({
                    mode: "single"
                });
                startSelection(context);

            })
            .catch(function () {
                console.log("Uh oh, no permissions - plan B time!");
            });

    };

    viewModel.OpendatePicker = function () {
        PickerManager.init(function (date) {
            if (date) {
                var timestamp = new moment(date, "DD MM YYYY HH:mm z");
                var SelectedDate = new Date(timestamp);
                DateStamp = timestamp;
                var momentIns = new moment(SelectedDate);
                viewModel.set('dob', momentIns.format("LL"));
            }

        }, null, null, "Apply", "NotApply");

        PickerManager.showDatePickerDialog();
    };

    viewModel.submit = function () {

    };

    page.bindingContext = viewModel;
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
                        profile_pic.imageSource = args.image;
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
    try{

    Loaddialog.show();
    http.request({
        url: applicationSettings.getString("server") + "/api/upload/user",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-acaps-key": applicationSettings.getString("s_key")
        },
        content: JSON.stringify({base64: bs64})
    }).then(function (response) {
        Loaddialog.hide();
        var result = response.content.toJSON();

    }, function (e) {
        Loaddialog.hide();

        console.log("Error occurred " + e);
    });

    }catch (er){
        console.log(er);
    }
}
exports.onNavigatingTo = onNavigatingTo;