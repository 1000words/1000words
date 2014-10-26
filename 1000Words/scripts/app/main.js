var app = (function () {
    window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
        alert(url + ":" + lineNumber + ": " + errorMsg);
        return false;
    }
    
    var everlive = new Everlive({
            apiKey: settings.Settings.everlive.apiKey,
            scheme: settings.Settings.everlive.schema
        });

    var mobileApp = new kendo.mobile.Application(document.body, {
        transition: 'slide',
        statusBarStyle: statusBarStyle,
        skin: 'flat'
    });

    var onDeviceReady = function () {
        enablePushNotifications(); 
        navigator.splashscreen.hide();
        document.addEventListener("backbutton", onBackKeyDown, false);
    }
    
    
    var notificationReceived = function(notification){
        notifications.NotificationsViewModel.onNotificationReceived(notification);
    }
    
    var enablePushNotifications = function () {
        var currentDevice = everlive.push.currentDevice(false),
            settings = this.settings.Settings.pushSettings;
        
        settings.notificationCallbackAndroid = notificationReceived;
        settings.notificationCallbackIOS = notificationReceived;
        
        currentDevice.enableNotifications(settings)
            .then(
                function(initResult) {
                    return currentDevice.getRegistration();
                },
                function(err) {
                    alert("ERROR!<br /><br />An error occured while initializing the device for push notifications.<br/><br/>" + err.message);
                }
            ).then(
                function(registration) {                        
                    finishPushRegister();                      
                },
                function(err) {
                    if(err.code === 801) {
                        registerInEverlive();      
                    }
                    else {                        
                        alert("ERROR!<br /><br />An error occured while checking device registration status: <br/><br/>" + err.message);
                    }
                }
            );
        };
    
    var registerInEverlive = function() {
        var currentDevice = everlive.push.currentDevice();
                 
        if (!currentDevice.pushToken) {
            alert("ERROR! Unable to register for push notifications, no push token.")
        }
        
        everlive.push.currentDevice()
            .register({ DeviceID: device.uuid })
            .then(
            function() {
                finishPushRegister();
            },
            function(err) {
                alert('REGISTER ERROR: ' + JSON.stringify(err));
            }
        );
    };
    
    var finishPushRegister = function() {
        mobileApp.navigate('views/mapExplorerView.html');
    };

    var os = kendo.support.mobileOS,
        statusBarStyle = os.ios && os.flatVersion >= 700 ? 'black-translucent' : 'black';

    function onBackKeyDown() {
        navigator.app.exitApp();
        navigator.compass.clearWatch(app.MapExplorerViewModel.whatchId);
    }
    
    
    document.addEventListener('deviceReady', onDeviceReady, false);
    
    var show = function() {
    }

    return {
        everlive: everlive,
        mobileApp: mobileApp,
        show: show
    }
})();
