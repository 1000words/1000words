var notifications = notifications || {};

notifications.NotificationsViewModel = kendo.observable({
    notifications: [],

    hasNotification: false,

    notificationCount: 0,

    onNotificationReceived: function (notification) {
        this.set('hasNotification', true);
        if (typeof (notification) != 'undefined') {
            var n = {
                payload: notification,
                notificationListItemClick: this.notificationListItemClick,
                dismissClick: this.dismissClick
            };
            
            this.notifications.push(n);
            this.set('notificationCount', this.notifications.length);
        }
    },

    onBadgeClicked: function () {    
        var container = $('#notificationListContainer');
        if (!container.is(':visible')) {
            $("#notificationList").kendoMobileListView({
                dataSource: this.notifications,
                template: "<div><span data-bind='{click: notificationListItemClick}'>#:payload.payload.message.Message#</span><span data-bind='click: dismissClick'>X</span><div>",
            });
            container.show("slow");
        } else {
            container.hide("slow");
        }
    },
    
    notificationListItemClick: function(e) {
        app.notificationWindowViewModel.activeNotification = e.dataItem.payload;
        app.mobileApp.navigate('views/notificationWindow.html');
    },
    
    dismissClick: function(e) {
        
    }
});