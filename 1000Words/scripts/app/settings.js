var settings = settings || {};

settings.Settings = (function() {
    
    var everlive = {
        apiKey: 'bdkTSSiByo7QWhDS',
        schema: 'http'
    };
    
    var googleProjectNumber = '930173497200';
    
    var pushSettings = {
        android: {
            senderID: googleProjectNumber
        },
        wp8: {
            channelName: "100WordsChannel"
        },
        iOS: {
            badge: "true",
            sound: "true",
            alert: "true"
        },
        wp8:{
            channelName: '1000WordsChannel'
        }
    };
    
    return {
        everlive: everlive,
        googleProjectNumber: googleProjectNumber,
        pushSettings: pushSettings
    };
})(); 