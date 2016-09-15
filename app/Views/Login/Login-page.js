var createViewModel = require("./login-view-model").createViewModel;
var buttonModule = require('ui/button');
var application = require("application");
var platform = require("platform");
function onNavigatingTo(args) {
    var page = args.object; 
    page.bindingContext = createViewModel();
    if (application.android && platform.device.sdkVersion >= '21') {
        try {
            var window = app.android.startActivity.getWindow();
            window.setStatusBarColor(0x000000);
            var decorView = window.getDecorView();
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                // | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION // hide nav bar
                // | View.SYSTEM_UI_FLAG_FULLSCREEN // hide status bar
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        } catch (err) {
            console.log(err);
        }
    }


    if (application.android) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
            args.cancel = true;
            args.activity.finish();
        });
    }
    page.cssFile = "Login-page.css";
    var btn = new buttonModule.Button();
    btn.id = "login-button"
}


exports.onNavigatingTo = onNavigatingTo;