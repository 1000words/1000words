var app = (function(){
    var mobileApp = new kendo.mobile.Application(document.body, {
                                                     transition: 'slide',
                                                     statusBarStyle: statusBarStyle,
                                                     skin: 'flat'
                                                 });
    
    var onDeviceReady = function(){
        //mobileApp.navigate('views/splashScreen.html');
        
        navigator.splashscreen.hide();
    }
    
    var os = kendo.support.mobileOS,
        statusBarStyle = os.ios && os.flatVersion >= 700 ? 'black-translucent' : 'black';
    
    document.addEventListener('deviceReady', onDeviceReady, false);
})();