/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var Observable = require("data/observable").Observable;
var frame = require('ui/frame');

function createViewModel() {
     var viewModel = new Observable();

    return viewModel;


}


exports.createViewModel = createViewModel;