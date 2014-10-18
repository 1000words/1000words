var notifications = notifications || {};

notifications.NotificationsViewModel = kendo.observable({
    notifications: [],

    hasNotification: false,

    notificationCount: 0,

    onNotificationReceived: function (notification) {
        this.set('hasNotification', true);
        if (typeof (notification) != 'undefined') {
            this.notifications.push(notification);
            this.set('notificationCount', this.notifications.length);
        }
    },

    onBadgeClicked: function () {    
        var container = $('#notificationListContainer');
        if (!container.is(':visible')) {
            $("#notificationList").kendoMobileListView({
                dataSource: this.notifications,
                template: "<div>#:payload.message.Message#<div>",
                click: this.notificationListItemClick,
            });
            container.show("slow");
        } else {
            container.hide("slow");
        }
    },
    
    notificationListItemClick: function(e) {
        app.NotificationWindowViewModel.activeNotification = e.dataItem.payload;
        app.mobileApp.navigate('views/notificationWindow.html');
    },
    
    dismissClick: function(e) {
        
    }
});