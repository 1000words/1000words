var app = app || {};

app.NotificationsViewModel = kendo.observable({
    notifications: [{
        Message: 'Test',
        Payload: {
            DeviceId: '2123121'
        }
    }, {
        Message: 'Test1',
        Payload: {
            DeviceId: '2123121'
        }
    }, {
        Message: 'Test3',
        Payload: {
            DeviceId: '2123121'
        }
    }, {
        Message: 'Test4',
        Payload: {
            DeviceId: '2123121'
        }
    }, {
        Message: 'Test5',
        Payload: {
            DeviceId: '2123121'
        }
    }],

    hasNotification: false,

    notificationCount: 76,

    onNotificationReceived: function (notification) {
        this.set('hasNotification', true);
        if (typeof (noticiation) != 'undefined') {
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