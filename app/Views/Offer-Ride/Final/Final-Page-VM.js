/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var Observable = require("data/observable").Observable;
var frame = require('ui/frame');
var viewModel;
function createViewModel(model) {

    if (model) {
        viewModel = model;
    } else {
        viewModel = new Observable();
    }
    viewModel.latitude = 6;
    viewModel.zoom = 9;
    viewModel.longitude = 60;
    return viewModel;
}

exports.createViewModel = createViewModel;
