/**
 * Created by Sarath Kumar on 9/4/2016.
 */
var  Application = require('application-settings');
exports.Const = {
    FIREBASE: "https://acaps-android.firebaseio.com/Server.json",
   
};

exports.API_KEY =  Application.getString("s_key");

exports.SERVER  = Application.getString("server");
