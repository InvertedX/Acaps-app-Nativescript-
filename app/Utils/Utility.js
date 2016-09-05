/**
 * Created by Sarath Kumar on 9/3/2016.
 */
var connectivity = require("connectivity");
var connectionType = connectivity.getConnectionType();
var applicationSettings = require("application-settings");
exports.Util = function () {
    return {
        Connectivity: function (callback) {

            var dialogs = require('ui/dialogs');
            switch (connectionType) {
                case connectivity.connectionType.none:
                    dialogs.alert("No internet Connection.");
                    callback(false);
                    break;
                case connectivity.connectionType.wifi:

                    console.log("WiFi connection");
                    callback(true);
                    break;
                case connectivity.connectionType.mobile:
                    console.log("Mobile connection");
                    callback(true);

                    break;
            }

        },

        MonitorNetwork: function (callback) {
            connectivity.startMonitoring(function onConnectionTypeChanged(newConnectionType) {
                switch (newConnectionType) {
                    case connectivity.connectionType.none:
                        break;
                    case connectivity.connectionType.wifi:
                        console.log("Connection type changed to WiFi.");
                        callback(true);
                        break;
                    case connectivity.connectionType.mobile:
                        console.log("Connection type changed to mobile.");
                        callback(true);
                        break;
                }
            });
//...
        }

        , StopMonitor: function () {
            connectivity.stopMonitoring();
        }

        ,getServer : function () {
            return applicationSettings.getString("server");
        }
    }
};