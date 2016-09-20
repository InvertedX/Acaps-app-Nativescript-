/**
 * Created by Sarath Kumar on 9/21/2016.
 */

var application = require("application");
var Observable = require("data/observable").Observable;

var page;
var viewModel;
var context;
function onNavigatingTo(args) {
    page = args.object;
    page.cssFile = "RideView-Page.css";
    if (page.navigationContext) {
        context = page.navigationContext;
    }
    viewModel = new Observable();

    viewModel.Ride = {
        id: 1,
        source: "Kochi",
        source_id: "ChIJv8a-SlENCDsRkkGEpcqC1Qs",
        source_latlng: "{\"_observers\":{},\"disableNotifications\":{},\"_map\":{}}",
        destination: "Kollam",
        destination_id: "ChIJIcap3Vv8BTsR93JzJpUx8Is",
        destination_latlng: "{\"_observers\":{},\"disableNotifications\":{},\"_map\":{}}",
        waypoints: "[\"Kottayam\"]",
        waypoints_id: "[\"ChIJX0NrbKErBjsRbtCNj_YCK74\"]",
        waypoints_latlng: "[{\"lat\":9.591566799999999,\"lng\":76.5221531}]",
        travel_date_time: "2016-09-20T17:59:00.000Z",
        seats: 6,
        description: "Just testing out acaps",
        gender_preference: "none",
        Rate: 0,
        Phone: 255636,
        createdAt: "2016-09-18T12:29:40.000Z",
        updatedAt: "2016-09-18T12:29:40.000Z",
        userId: 2,
        "carId": 1,
        "user": {
            id: 2,
            Activated: true,
            name: "Rob Stark",
            gender: "NULL",
            dob: null,
            email: "rob@stark.com",
            Department: "Faculty",
            type: "faculty",
            phone: "255636",
            profile_pic: "",
            createdAt: "2016-09-18T11:26:23.000Z",
            updatedAt: "2016-09-18T11:26:23.000Z"
        },
        "car": {
            "id": 1,
            "model": "Figo",
            "manufacturer": "Ford",
            "regnumber": "KL 10 11562",
            "photo": "01",
            "createdAt": "2016-09-18T00:00:00.000Z",
            "updatedAt": "2016-09-18T00:00:00.000Z",
            "userId": 2
        }
    };
    page.bindingContext = viewModel;

}

function onMapReady(args) {

}

exports.onMapReady = onMapReady;
exports.onNavigatingTo = onNavigatingTo;