var app = app || {};

app.NotificationWindowViewModel = (function() {
    var viewModel = (function(){
        
        var activeNotification = {};
        
        var init = function(){
        };
        
        var show = function() {
        };
        
        var reply = function() {
            alert('Open, camera!')
            return false;
        }
        
        var dismiss = function() {
            app.mobileApp.navigate('#:back');
            return false;
        }
        
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
