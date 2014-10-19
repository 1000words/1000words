var app = app || {};

app.NotificationWindowViewModel = kendo.observable({
    activeNotification: {},

    isProgressVisible: false,

    progressText: '',

    init: function () {
        app.NotificationWindowViewModel.initMap();
    },

    show: function () {},

    reply: function () {
        this.takePicture();
        return false;
    },

    dismiss: function () {
        app.mobileApp.navigate('#:back');
        return false;
    },

    initMap: function () {
        
        var mapProp = {
            center: new google.maps.LatLng(0, 0),
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("googleMapView"), mapProp);

        google.maps.event.addListener(map, 'zoom_changed', function () {
            showVisibleCities(360 - previousCompassAngle);
        });
    },

    takePicture: function () {
        var that = this;
        navigator.camera.getPicture(function (data) {
                that.set('isProgressVisible', true);
                that.set('progressText', 'Sending picture...');
                var filename = Math.random().toString(36).substring(2, 15) + ".jpg";
                app.everlive.Files.create({
                    Filename: filename,
                    ContentType: "image/jpeg",
                    base64: data
                }).then(function () {
                    $.get('http://api.everlive.com/v1/' + settings.Settings.everlive.apiKey + '/functions/sendPhoto?to=' + app.NotificationWindowViewModel.activeNotification.payload.message.DeviceId + '&imageName=' + filename + '&sender=' + device.uuid);

                    that.set('isProgressVisible', false);
                    app.mobileApp.navigate('#:back');
                });
            },
            function (msg) {
                that.set('isProgressVisible', false);
                //alert(msg);
            }, {
                destinationType: Camera.DestinationType.DATA_URL,
                targetHeight: 400,
                targetWidth: 400
            });
    }
});