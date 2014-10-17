var app = (function () {
    var everlive = new Everlive({
            apiKey: settings.everlive.apiKey,
            scheme: settings.everlive.schema
        });

    var mobileApp = new kendo.mobile.Application(document.body, {
        transition: 'slide',
        statusBarStyle: statusBarStyle,
        skin: 'flat'
    });

    var onDeviceReady = function () {
        //mobileApp.navigate('views/splashScreen.html');
        setTimeout(function () {
            mobileApp.navigate('views/mapExplorerView.html');
        }, 1000);
        
        navigator.splashscreen.hide();
    }

    var os = kendo.support.mobileOS,
        statusBarStyle = os.ios && os.flatVersion >= 700 ? 'black-translucent' : 'black';

    document.addEventListener('deviceReady', onDeviceReady, false);

    return {
        everlive: everlive
    }
})();