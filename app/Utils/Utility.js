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

        , getServer: function () {
            return applicationSettings.getString("server");
        }
    }
};

exports.PriceCalculate = function (Distance, rate, noSeats) {
    var cost = {
        'minimum': null,
        'maximum': null,
        'avg': null
    };

    var actual = Distance * rate;
    cost.maximum = actual / noSeats;
    cost.avg = cost.maximum / 2;
    cost.minimum = cost.maximum / 10;
    if (cost.minimum < 10) {
        cost.minimum = 10;
    }
    else {
        cost.minimum = cost.minimum / 10;
        cost.minimum = Math.round(cost.minimum) * 10;
    }
    cost.avg = cost.avg / 10
    cost.avg = Math.round(cost.avg) * 10;
    cost.maximum = cost.maximum / 10
    cost.maximum = Math.round(cost.maximum) * 10;
    return cost;
 

};