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
            };

            this.notifications.push(n);
            this.set('notificationCount', this.notifications.length);
        }
    },

    onBadgeClicked: function () {
        var container = $('#notificationListContainer');
        $('#notificationListContainer').kendoMobileScroller();
        if (!container.is(':visible')) {
            $("#notificationList").kendoMobileListView({
                dataSource: this.notifications,
                template: "<div><span id='accept#:payload.payload.message.DeviceId#'>#:payload.payload.message.Message#</span><span id='reject#:payload.payload.message.DeviceId#'> X </span></div>"
            });
            container.show("slow");

            for (var i = 0; i < this.notifications.length; i++) {
                var notif = this.notifications[i];
                $("#accept" + notif.payload.payload.message.DeviceId).click((function (n) {
                    return function () {
                        app.NotificationWindowViewModel.activeNotification = n.payload;
                        app.mobileApp.navigate('views/notificationWindow.html');
                    };
                })(notif));
                $("#reject" + notif.payload.payload.message.DeviceId).click((function (n) {
                    return function () {
                        alert('reject ' + n.payload.payload.message.DeviceId);
                    };
                })(notif));
            }
        } else {
            container.hide("slow");
        }
    },

    notificationListItemClick: function (e) {
        app.notificationWindowViewModel.activeNotification = e.dataItem.payload;
        app.mobileApp.navigate('views/notificationWindow.html');
    },

    dismissClick: function (e) {

    }
});