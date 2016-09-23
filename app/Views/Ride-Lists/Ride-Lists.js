/**
 * Created by Sarath Kumar on 9/22/2016.
 */

var buttonModule = require('ui/button');
var application = require("application");
var Observable = require("data/observable").Observable;
var View = require("ui/core/view");

var ViewModel;

function onNavigatingTo(args) {
    var page = args.object;
    ViewModel = new Observable();
    if (page.navigationContext.restrict = "MY_RIDES") {

    } else if (page.navigationContext.restrict = "REQUESTED_RIDES") {

    }


    page.bindingContext = ViewModel;

}
exports.onNavigatingTo = onNavigatingTo;

