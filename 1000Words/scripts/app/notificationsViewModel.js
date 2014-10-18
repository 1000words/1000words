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
                template: "<div><span>#:payload.message.Message#</span><div>",
            });

            container.show("slow");
        } else {
            container.hide("slow");
        }
    }
});