var buttonModule = require('ui/button');
var application = require("application");
var viewModel = require("./Home-viewmodal").createViewModel;
var dialog = require("ui/dialogs");
var frame = require("ui/frame");

function onNavigatingTo(args) {
    var page = args.object; 
    page.bindingContext = viewModel(page); 
    page.cssFile = "Home-Page.css";
}

exports.onNavigatingTo = onNavigatingTo;