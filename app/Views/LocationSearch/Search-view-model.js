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

function createViewModel(context) {
    var viewModel = new Observable();
    viewModel.locations = new ObseravableArray.ObservableArray([]);
    viewModel.loactionSearch = "";
    viewModel.progress = 0;
    viewModel.progressvisibi = "collapse";
    listViewModule =
        viewModel.on(Observable.propertyChangeEvent, function (propertyChangeData) {
            if (propertyChangeData.propertyName == 'loactionSearch') {
                viewModel.set('progressvisibi', "visible");
                viewModel.set('progress', 15);
                GPlaces.find(propertyChangeData.value, function (data) {
                    viewModel.locations.splice(0, viewModel.locations.length);
                    viewModel.set('progress', 40);
                    data.forEach(function (data) {
                        viewModel.locations.push(data);
                    });
                    viewModel.set('progress', 100);
                    setTimeout(function () {
                        viewModel.set('progressvisibi', "collapse");
                    }, 800);

                });
            }
        });

    viewModel.listViewItemTap = function (args) {
        GPlaces.getplace(viewModel.locations.getItem(args.index).place_id, function (place) {
            console.log('CALLBACKED');
            context[context.payload] = place;
            if (context.payload == "source") {
                context.rideData.source = place.short_name;
                context.rideData.source_id = place.place_id;
                context.rideData.source_lat_lng = place.place_id;
            } else if (context.payload == "destination") {
                context.rideData.destination = place.short_name;
                context.rideData.destination_id = place.place_id;
                context.rideData.destination_lat_lng = place.place_id;
            }

            topmost.transition = {name: "slideRight"};
            try {
                topmost.navigate({
                    moduleName: context.result_to_who,
                    context: context
                });

            } catch (er) {
                console.error(er);
            }
        });
    };
    return viewModel;


}


exports.createViewModel = createViewModel;