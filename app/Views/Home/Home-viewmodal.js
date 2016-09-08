/**
 * Created by Sarath Kumar on 9/7/2016.
 */

var Observable = require("data/observable").Observable;
var frame = require('ui/frame');

function createViewModel() {
    var topmost = frame.topmost();
    var viewModel = new Observable();
    viewModel.shits  = "Hello";
    viewModel.offerride = function () {
        topmost.transition = {name: "slideRight"};
        topmost.navigate('/Views/Offer-Ride/Offer-Ride')

    };
    viewModel.findride = function () {
        topmost.transition = {name: "slideLeft"};
         topmost.navigate({
            moduleName: "/Views/LocationSearch/Search-Page",
            context: viewModel
        });
/*
        topmost.navigate('/Views/Find-Ride/Find-Ride')
*/
    };

    return viewModel;


}


exports.createViewModel = createViewModel;