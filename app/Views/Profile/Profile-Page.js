/**
 * Created by Sarath Kumar on 9/20/2016.
 */
var buttonModule = require('ui/button');
var application = require("application");
var Observable = require("data/observable").Observable;
var View = require("ui/core/view");


function onNavigatingTo(args) {
    var page = args.object;
    var ViewModel = new Observable();

    page.bindingContext = ViewModel;

}