var fbmanager = {
    debug_mode: false,
    appId: '',
    user: {
        login_status: 'unknown',
        granted_scopes: [],
        name: '',
        uid: 0,
        accessToken: '',
        accountInfoMap: {},
    },
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
                appId: self.appId,
                version: 'v2.12'
            });
            self.refreshPermission(initCallback);
        });
    },
    refreshPermission: function (refreshPermissionCallback) {
        this.debug_log("fbmanager::refreshPermission");

        this.user.login_status = 'unknown';
        this.user.granted_scopes = [];
        this.user.name = '';
        this.user.uid = 0;
        this.user.accessToken = '';
        this.user.accountInfoMap = {};
        var self = this;

        FB.getLoginStatus(function (response) {
            self.debug_log("fbmanager::refreshPermission=>getLoginStatus");
            self.user.login_status = response.status;

            if (response.status === 'connected') {
                self.user.uid = response.authResponse.userID;
                self.user.accessToken = response.authResponse.accessToken;
                FB.api('/me/permissions', function (response) {
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].status == 'granted') {
                            self.user.granted_scopes.push(response.data[i].permission)
                        }
                    }
                    FB.api('/me', function (response) {
                        if (typeof response.name !== 'undefined')
                            self.user.name = response.name;
                        self.refreshAccounts(refreshPermissionCallback, response);
                    });
                });
            } else if (response.status === 'not_authorized') {
                self.refreshAccounts(refreshPermissionCallback, response);
            } else {
                self.refreshAccounts(refreshPermissionCallback, response);
            }
        });
    },
    refreshAccounts: function (refreshPermissionCallback, permissionResponse) {
        var self = this;
        new FbApiListLoader().api('/me/accounts/', undefined, function (response) {
            $.each(response.resultArray, function()
            {
                self.user.accountInfoMap[this.id] = this.access_token;
            });
            refreshPermissionCallback(permissionResponse);
        });
    },
    checkForLackingPermission: function (requiredPermissions) {
        var ret = [];
        for (var i = 0; i < requiredPermissions.length; i++) {
            if (this.user.granted_scopes.indexOf(requiredPermissions[i]) == -1)
                ret.push(requiredPermissions[i]);
        }
        return ret;
    },
};
