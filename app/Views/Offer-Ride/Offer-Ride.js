/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var buttonModule = require('ui/button');
var application = require("application");
var ViewModel = require('./Offer-Ride-VM').createViewModel;
function onNavigatingTo(args) {
    var page = args.object;
    page.cssFile = "Offer-Ride.css";
    if (page.navigationContext) {
        page.bindingContext = ViewModel(page, page.navigationContext);
    } else {
        page.bindingContext = ViewModel(page, null);

    }

}

exports.onNavigatingTo = onNavigatingTo;