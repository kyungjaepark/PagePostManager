var fbmanager = {
    debug_mode: true,
    appId: '',
    user_login_status: 'unknown',
    user_granted_scopes: [],
    user_uid: 0,
    user_accessToken: '',
    debug_log: function (log) {
        if (this.debug_mode)
            console.log(log);
    },
    jQueryInit: function (appId, initCallback) {
        this.debug_log("fbmanager::jQueryInit");
        this.appId = appId;
        var self = this;
        $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
            FB.init({
                appId: this.appId,
                version: 'v2.5' // or v2.0, v2.1, v2.2, v2.3
            });
            self.refreshPermission(initCallback);
        });
    },
    refreshPermission: function (refreshPermissionCallback) {
        this.debug_log("fbmanager::refreshPermission");

        this.user_login_status = 'unknown';
        this.user_granted_scopes = [];
        this.user_uid = 0;
        this.user_accessToken = '';
        var self = this;

        FB.getLoginStatus(function (response) {
            this.debug_log("fbmanager::refreshPermission=>getLoginStatus");
            self.user_login_status = response.status;

            if (response.status === 'connected') {
                self.user_uid = response.authResponse.userID;
                self.user_accessToken = response.authResponse.accessToken;
                FB.api('/me/permissions', function (response) {
                    console.log(response);
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].status == 'granted') {
                            self.user_granted_scopes.push(response.data[i].permission)
                        }
                    }
                    refreshPermissionCallback();
                });
            } else if (response.status === 'not_authorized') {
                refreshPermissionCallback();
            } else {
                refreshPermissionCallback();
            }
        });
    },
};
