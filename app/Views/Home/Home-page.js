var buttonModule = require('ui/button');
var application = require("application");
var viewModel = require("./Home-viewmodal").createViewModel;
var dialog = require("ui/dialogs");

function onNavigatingTo(args) {
    var page = args.object;
    console.log("context",JSON.stringify(page.navigationContext));
    if(page.navigationContext){
        page.bindingContext = page.navigationContext;
    }else {
        page.bindingContext = viewModel();

    }
}

exports.onNavigatingTo = onNavigatingTo;