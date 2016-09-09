/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var Observable = require("data/observable").Observable;
var frame = require('ui/frame');
var animation = require("ui/animation");
var enums = require("ui/enums");
var moment = require("moment");
var topmost = frame.topmost();
function createViewModel(page, model) {
    var viewModel;
    if (model) {
        viewModel = model;
        console.log(JSON.stringify(viewModel.rideData));
    } else {
        viewModel = new Observable();
        viewModel.rideData = {
            source: "Choose",
            source_id: "",
            source_lat_lng: [],
            destination: "Choose",
            destination_id: "",
            destination_lat_lng: []
        };
    }
    viewModel.destination = "To";
    viewModel.minDate = new Date();
    viewModel.Maxdate = new Date(moment(new Date()).add(2, "y").format());
    console.log(viewModel.Maxdate);
    viewModel.container = page.getViewById('timeContainer');
    viewModel.chooseSource = function () {
        topmost.transition = {name: "slideLeft"};
        viewModel.payload = "source";
        viewModel.result_to_who = "/Views/Offer-Ride/Offer-Ride";
        topmost.navigate({
            moduleName: "/Views/LocationSearch/Search-Page",
            context: viewModel
        });
    };
    viewModel.chooseDesination = function () {
        topmost.transition = {name: "slideLeft"};
        viewModel.payload = "destination";
        viewModel.result_to_who = "/Views/Offer-Ride/Offer-Ride";
        topmost.navigate({
            moduleName: "/Views/LocationSearch/Search-Page",
            context: viewModel
        });
    };
    viewModel.nextClick = function () {
       console.log(viewModel.date);
       console.log(viewModel.time);
    };
    return viewModel;
}

function timeAdd(date,date2) {
     var dateMillis = date.getTime();

     var timePeriod = "00:15:00"; //I assume this is 15 minutes, so the format is HH:MM:SS

    var parts = timePeriod.split(/:/);
    var timePeriodMillis = (parseInt(parts[0], 10) * 60 * 60 * 1000) +
        (parseInt(parts[1], 10) * 60 * 1000) +
        (parseInt(parts[2], 10) * 1000);

    var newDate = new Date();
    newDate.setTime(dateMillis + timePeriodMillis);
}
exports.createViewModel = createViewModel;