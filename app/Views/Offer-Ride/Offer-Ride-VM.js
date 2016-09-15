/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var Observable = require("data/observable").Observable;
var frame = require('ui/frame');
var animation = require("ui/animation");
var enums = require("ui/enums");
var topmost = frame.topmost();

function createViewModel(page, model) {
    var viewModel;
    if (model) {
        viewModel = model;
        console.log(JSON.stringify(viewModel.rideData));
    } else {
        viewModel = new Observable();
        viewModel.rideData = new Observable({
            source: "Choose",
            source_id: "",
            source_lat_lng: {},
            destination: "Choose",
            destination_id: "",
            destination_lat_lng: {},
            waypoints: []
        });
    }
    viewModel.destination = "To";
    viewModel.time = new Date();
    viewModel.date = new Date();
    viewModel.minDate = new Date();
    viewModel.Maxdate = new Date(moment(new Date()).add(2, "y").format());
    console.log(viewModel.Maxdate);
    viewModel.container = page.getViewById('timeContainer');
    viewModel.chooseSource = function () {
      

    };
    viewModel.chooseDesination = function () {

        var modalPageModule = "/Views/LocationSearch/Search-Page";
        var context = {
            type: "source"
        };
        var fullscreen = false;
        page.showModal(modalPageModule, context, function closeCallback(data) {
            if (data) {

                viewModel.rideData.destination = data.placename;
                viewModel.rideData.destination_id = data.place_id;
                viewModel.rideData.destination_lat_lng = data.place_id_lat_lng;
                console.log(JSON.stringify(viewModel.rideData));
            }
        }, fullscreen);

    };
    viewModel.nextClick = function () {

        var time = new moment(viewModel.date);
        time.hour(viewModel.time.getHours());
        time.minute(viewModel.time.getMinutes());
        topmost.transition = {name: "slideLeft"};
        topmost.navigate({
            moduleName: '/Views/Offer-Ride/Final/Final-Page',
            context: viewModel
        });
    };
    return viewModel;
}

exports.createViewModel = createViewModel;