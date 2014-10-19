var notifications = notifications || {};

notifications.NotificationsViewModel = kendo.observable({
    notifs: [],

    hasNotification: false,

    notificationCount: 0,

    onNotificationReceived: function (notification) {
        this.set('hasNotification', true);
        alert(JSON.stringify(notification));
        if (typeof (notification) != 'undefined') {
            this.notifs.push(notification);
            this.set('notificationCount', this.notifs.length);
        }
    },

    onBadgeClicked: function () {
        var container = $('#notificationListContainer');
        $('#notificationListContainer').kendoMobileScroller();
        if (!container.is(':visible')) {
            $("#notificationList").kendoMobileListView({
                dataSource: this.notifs,
                template: "<div><span class='notificationContent' id='accept#:payload.message.Sender#'>#:payload.message.Message#</span><span class='cancelNotification' id='reject#:payload.message.Sender#'></span></div>",
            });
            container.show("slow");
            this.setClickListeners();
        } else {
            container.hide("slow");
        }
    },

    setClickListeners: function () {
        for (var i = 0; i < this.notifs.length; i++) {
            var notif = this.notifs[i];

            $("#accept" + notif.payload.message.Sender).click((function (n, index, removeNotification) {
                return function () {
                    app.NotificationWindowViewModel.activeNotification = n.payload;
                    removeNotification(index);
                    $('#notificationListContainer').hide();
                    app.mobileApp.navigate('views/notificationWindow.html');
                };
            })(notif, i, this.removeNotification));

            $("#reject" + notif.payload.message.Sender).click((function (n, index, removeNotification) {
                return function () {
                    removeNotification(index);
                }
            })(notif, i, this.removeNotification));
        }
    },

    removeNotification: function (index) {
        this.notifications.NotificationsViewModel.notifs.splice(index, 1);
        $("#notificationList").data("kendoMobileListView").dataSource.read();
        this.notifications.NotificationsViewModel.setClickListeners();

        if (this.notifications.NotificationsViewModel.notifs.length === 0) {
            $('#notificationListContainer').hide();
            this.notifications.NotificationsViewModel.set('hasNotification', false);
        }

        this.notifications.NotificationsViewModel.set('notificationCount', this.notifications.NotificationsViewModel.notifs.length);
    }
});