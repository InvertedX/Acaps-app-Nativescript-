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
    var context = page.navigationContext;  
    page.bindingContext = createViewModel(context);
     if (application.android) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
            args.cancel = true;
            frame.topmost().transition = {name: "slideLeft"};
            frame.topmost().navigate({
                moduleName: '/Views/Home/Home-page',
             });

        });
    }
}

exports.onNavigatingTo = onNavigatingTo;