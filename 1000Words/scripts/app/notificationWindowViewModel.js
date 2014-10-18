var app = app || {};

app.NotificationWindowViewModel = kendo.observable({
    activeNotification: {},
    
    isProgressVisible: false,
    
    progressText: '',
    
    init: function(){
    },
    
    show: function() {
    },
    
    reply: function() {
        this.takePicture();
        return false;
    },
    
    dismiss: function() {
        app.mobileApp.navigate('#:back');
        return false;
    },
    
    takePicture: function() {
        var that = this;
        navigator.camera.getPicture(function (data) {
            that.set('isProgressVisible', true);
            that.set('progressText', 'Sending picture...');
            var filename = Math.random().toString(36).substring(2, 15) + ".jpg";
            app.everlive.Files.create({
                Filename: filename,
                ContentType: "image/jpeg",
                base64: data
            }).then(function() {
                $.get('http://api.everlive.com/v1/' + settings.Settings.everlive.apiKey 
                      + '/functions/sendPhoto?to=' + app.NotificationWindowViewModel.activeNotification.payload.message.DeviceId 
                      + '&imageName=' + filename 
                      + '&sender=' + device.uuid);
                
                that.set('isProgressVisible', false);
                app.mobileApp.navigate('#:back');
            });
            },
            function(msg) {
                that.set('isProgressVisible', false);
                //alert(msg);
            }, 
            {
                destinationType: Camera.DestinationType.DATA_URL,
                targetHeight: 400,
                targetWidth: 400
            });
    }  
});

