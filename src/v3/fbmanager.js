var fbmanager = {
    debug_mode: false,
    appId: '',
    debug_logs: [],
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
        this.debug_logs.push(log);
    },
    jQueryInit: function (appId, fbAppVersion, initCallback) {
        this.debug_log("fbmanager::jQueryInit");
        this.appId = appId;
        var self = this;
        $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
            FB.init({
                appId: self.appId,
                version: fbAppVersion
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
            self.user.login_status = response.status;
            self.debug_log("fbmanager::refreshPermission=>getLoginStatus = " + response.status);

            if (response.status === 'connected') {
                self.user.uid = response.authResponse.userID;
                self.user.accessToken = response.authResponse.accessToken;
                FB.api('/me/permissions', function (response) {
                    self.debug_log("/me/permissions returned.");
                    for (var i = 0; i < response.data.length; i++) {
                        self.debug_log(response.data[i].status + ":" + response.data[i].permission);
                        if (response.data[i].status == 'granted') {
                            self.user.granted_scopes.push(response.data[i].permission)
                        }
                    }
                    FB.api('/me', function (response) {
                        self.debug_log("/me complete.");
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
        self.debug_log('refreshAccounts');
        new FbApiListLoader().api('/me/accounts/', undefined, function (response) {
            $.each(response.resultArray, function()
            {
                self.user.accountInfoMap[this.id] = this.access_token;
                self.debug_log('/me/accounts : ' + this.id);
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
