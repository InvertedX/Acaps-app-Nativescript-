/**
 * Created by Sarath Kumar on 9/5/2016.
 */
var Observable = require("data/observable").Observable;
var frame = require('ui/frame');
var dialogs = require('ui/dialogs');
var http = require('http');
var Utility = require('../../Utils/Utility').Util();
var topmost = frame.topmost();
var applicationSettings = require("application-settings");
var GPlaces = require("./LocationSearch");
var ObseravableArray = require("data/observable-array");
var googleServerApiKey = "AIzaSyAJsjpzjoI4d7QIm9fNse2-IUXrhhe2_Ys "
var listViewModule = require("ui/list-view");
var searchBarModule = require("ui/search-bar");
var utils = require("utils/utils")

var Callback;
var progress, listview;
var android;
function createViewModel(callback, page) {

    if (page.android) {
        var imm = utils.ad.getInputMethodManager();
 
    }
    var viewModel = new Observable();
    Callback = callback;
    progress = page.getViewById("progress");
    listview = page.getViewById("listlocations");
    progress.visibility = "collapse";
    viewModel.locations = new ObseravableArray.ObservableArray([]);
    viewModel.progressvisibile = "collapse";
    viewModel.loactionSearch = "";
    listViewModule =
        viewModel.on(Observable.propertyChangeEvent, function (propertyChangeData) {
            if (propertyChangeData.propertyName == 'loactionSearch') {
                if (propertyChangeData.value.length > 1) {
                    progress.visibility = "visible";
                    listview.visibility = "collapse";
                    GPlaces.find(propertyChangeData.value, function (data) {
                        viewModel.locations.splice(0, viewModel.locations.length);
                        progress.visibility = "collapse";
                        listview.visibility = "visible";
                        data.forEach(function (data) {
                            viewModel.locations.push(data);
                        });

                    });

                }
            }
        });

    viewModel.listViewItemTap = function (args) {
        console.log("CKD");
        try {
            GPlaces.getplace(viewModel.locations.getItem(args.index).place_id, function (place) {
                var rideData;
                rideData = {
                    placename: place.short_name,
                    place_id: place.place_id,
                    place_id_lat_lng: place.location
                };
                callback(rideData);

            });
        } catch (ee_) {
            console.log(ee_);
        }
    };
    return viewModel;


}


exports.createViewModel = createViewModel;
exports.onDismiss = function () {
    console.log("CALLBACKED");
    callback(null);
};