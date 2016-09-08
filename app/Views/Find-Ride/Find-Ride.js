/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var buttonModule = require('ui/button');
var application = require("application");
var ViewModel = require("./Find-Ride-VM").createViewModel;

function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = ViewModel();

}
exports.onNavigatingTo = onNavigatingTo;