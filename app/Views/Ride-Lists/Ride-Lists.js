/**
 * Created by Sarath Kumar on 9/22/2016.
 */

var buttonModule = require('ui/button');
var application = require("application");
var Observable = require("data/observable").Observable;
var View = require("ui/core/view");
var SERVER = require('../../Utils/Const').SERVER;
var KEY = require('../../Utils/Const').SS_KEY;
var frame = require('ui/frame');
var ViewModel;
var ListView;
var http = require('http');
var spinner, empty, rides;
function onNavigatingTo(args) {
    var page = args.object;
    ViewModel = new Observable();
    spinner = page.getViewById("loaderspinner");
    spinner.visibility = "collapsed";
    page.cssFile = "Ride-Lists.css";
    empty = page.getViewById('empty');
    empty.visibility = "collapsed";
    ListView = page.getViewById('Listview');

    ViewModel.itemTap = function (args) {
        console.log(args.index);
        console.dump(rides[args.index]);
        console.log(JSON.stringify(rides[args.index]));
        var navigationEntry = {
            backstackVisible: true,
            moduleName: '/Views/RideView/RideView-Page',
            context: rides[args.index]
        };
        frame.topmost().transition = {name: "slideLeft"};
        frame.topmost().navigate(navigationEntry);

    };



    if (page.navigationContext.restrict == "OFFERED_RIDES") {
        ViewModel.title = "Offered Rides";
        getRides('MY_RIDES');
    } else if (page.navigationContext.restrict == "REQUESTED_RIDES") {
        ViewModel.title = "Requested Rides";
        getRides('REQUESTED_RIDES');

    }
    page.bindingContext = ViewModel;
}
function getRides(arg) {
    var url = SERVER + "/api/";
    if (arg == 'MY_RIDES') {
        url = url + 'myrides'
    }
    if (arg == 'REQUESTED_RIDES') {
        url = url + 'requestedRides'
    }
    console.log(url);
    spinner.visibility = "visible";
    http.getJSON({
        url: url,
        method: "GET",
        headers: {
            "x-acaps-key": KEY
        }
    }).then(function (response) {
        spinner.visibility = "collapsed";
        if (response.length == 0) {
            empty.visibility = 'visible';
            ListView.visibility = "collapsed"
        }
        rides = response;
        console.dump(response);
        ListView.items = response;

    }, function (e) {
        spinner.visibility = "collapsed";
        console.log(e);
    });


}
exports.onNavigatingTo = onNavigatingTo;

