/**
 * Created by Sarath Kumar on 9/5/2016.
 */
var application = require("application");
var frame = require('ui/frame');
var listViewModule = require("ui/list-view");
var Observable = require("data/observable");
var labelModule = require("ui/label");
var createViewModel = require("./Search-view-model").createViewModel;

function onNavigatingTo(args) {
    var page = args.object;
    var context = args.context;
    context.callback= args.closeCallback;
    page.bindingContext = createViewModel(args.closeCallback,page);
    
}

exports.onNavigatingTo = onNavigatingTo;