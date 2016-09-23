/**
 * Created by Sarath Kumar on 9/23/2016.
 */
var imagepickerModule = require("nativescript-imagepicker");
var application = require("application");
var frame = require('ui/frame');
var listViewModule = require("ui/list-view");
var Observable = require("data/observable").Observable;
var viewModel;
var dialog = require('ui/dialogs');
var icModule = require("nativescript-imagecropper");
var image = require("image-source");
var permissions = require('nativescript-permissions');
var loader = require('../../Utils/Utility').Loader;
var CarImage;
var server = require('../../Utils/Const').SERVER;
var key = require('../../Utils/Const').API_KEY;
var LoaderDialoq;
var http = require('http');
function onNavigatingTo(args) {
    LoaderDialoq = new loader("Loading...");
    var page = args.object;
    viewModel = new Observable();
    var http = require('http');
    CarImage = page.getViewById('image');
    viewModel.cardata = {
        model: "",
        regnumber: "",
        manufacturer: "",
        imageBS64: ""
    };

    viewModel.AddCarDetails = function () {

        var reg = /^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/;
        console.log("REACHED fi4");
        if (viewModel.cardata.model.trim() == ""
            || viewModel.cardata.manufacturer.trim() == ""
            || viewModel.cardata.regnumber.trim() == "") {
             dialog.alert("all fields are required");
            console.log("FUCKED");
            return;


         }
        console.log("REACHED fi3");

        if (viewModel.cardata.imageBS64 == "") {
             dialog.alert("please choose an image");

            return;
        }
        console.log("REACHED fi2");

        console.log(reg.test(viewModel.cardata.regnumber));
        // if (!reg.test(viewModel.cardata.regnumber)) {
        //         alert("Register number not valid");
        //         return;
        //     }
        console.log("REACHED fi");
        LoaderDialoq.show()
        http.request({
            url: server + '/api/Addcar',
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-acaps-key": key

            },
            content: JSON.stringify(viewModel.cardata)
        }).then(function (response) {
            var res = JSON.parse(response.content);
            console.dump(res);
            LoaderDialoq.hide();
            if (res.status) {
                alert("Success");
            } else if (res.msg == "LIMIT_EXCEED") {
                alert("Limit exceeded you can only add 10 cars");
            }
        }, function (err) {
            console.log(err);
            LoaderDialoq.hide()
            alert("Acaps encountered an error trying to connect to the server.please try again");
        });

    };

    viewModel.choosecar = function () {
        console.log("CAKKED");
        try {
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
        } catch (er) {
            console.log(er);
        }
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
                        viewModel.cardata.imageBS64 = args.image.toBase64String();
                        CarImage.imageSource = args.image;

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

exports.onNavigatingTo = onNavigatingTo;