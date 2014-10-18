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
        iOS: {
            badge: "true",
            sound: "true",
            alert: "true"
        },
    };
    
    return {
        everlive: everlive,
        googleProjectNumber: googleProjectNumber,
        pushSettings: pushSettings
    };
})(); 