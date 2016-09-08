var buttonModule = require('ui/button');
var application = require("application");
var viewModel = require("./Home-viewmodal").createViewModel;
var dialog = require("ui/dialogs");

function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = viewModel();
 
}

exports.onNavigatingTo = onNavigatingTo;