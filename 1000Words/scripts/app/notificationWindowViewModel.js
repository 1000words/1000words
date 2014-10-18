var app = app || {};

app.NotificationWindowViewModel = (function() {
    var viewModel = (function(){
        
        var activeNotification = {};
        
        var init = function(){
        };
        
        var show = function() {
        };
        
        var reply = function() {
            takePicture();
            return false;
        };
        
        var dismiss = function() {
            app.mobileApp.navigate('#:back');
            return false;
        };
        
        var takePicture = function() {
            navigator.camera.getPicture(function (data) {
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
                    app.mobileApp.navigate('#:back');
                });
                },
                function(msg) {
                    alert(msg);
                }, 
                {
                    destinationType: Camera.DestinationType.DATA_URL,
                    targetHeight: 400,
                    targetWidth: 400
                });
        };
        
        return {
            init: init,
            show: show,
            reply: reply,
            dismiss: dismiss,
            activeNotification: activeNotification
        }
    })();
    
    return viewModel;
})();

