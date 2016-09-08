/**
 * Created by Sarath Kumar on 9/7/2016.
 */
var buttonModule = require('ui/button');
var application = require("application");
var ViewModel = require('./Offer-Ride-VM').createViewModel;
function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = ViewModel();
    if (application.android) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
             
            
        });
    }

}

exports.onNavigatingTo = onNavigatingTo;