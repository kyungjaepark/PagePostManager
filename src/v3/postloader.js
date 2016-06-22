function PostLoader() {
    this.reset();
}

PostLoader.prototype.reset = function () {
    this.isWebsite = false;
    this.reactionsLoader = new FbApiListLoader();
    this.commentsLoader = new FbApiListLoader();
    this.postId = 0;
    this.permalink_url = '';
    this.reactionsCount = 0;
    this.commentsCount = 0;
    this.loadReactions = false;
    this.loadComments = false;
    this.loadCompleteCallback = function () { };
    this.dialog = null;
    this.modal = null;
    this.locale = 'en_US';
}

PostLoader.prototype.stop = function () {
    this.reactionsLoader.stop();
    this.commentsLoader.stop();
}

PostLoader.prototype.init = function (postId, locale, successCallback, failCallback) {
    this.postId = postId;
    this.locale = locale;
    var _self = this;
    FB.api(
        "/" + this.postId,
        { 'fields': 'type' },
        function (response) {
            if (is_defined(response.error) && is_defined(failCallback)) {
                failCallback(response);
                return;
            }

            _self.isWebsite = (response['type'] == 'website');
            var fieldList = 'id,permalink_url,from,admin_creator,icon,message,updated_time,story,picture,reactions.summary(1).limit(1),comments.filter(stream).summary(1).limit(1),status_type';
            if (_self.isWebsite)
                fieldList = 'id,title,url,updated_time,picture,reactions.summary(1).limit(1),comments.filter(stream).summary(1).limit(1)';

            FB.api(
                "/" + _self.postId,
                { 'fields': fieldList, locale: _self.locale },
                function (response) {
                    if (is_defined(response.error) && is_defined(failCallback)) {
                        failCallback(response);
                        return;
                    }
                    _self.parseSummary(response, successCallback);
                });
        });
}

PostLoader.prototype.parseSummary = function (response, callback) {
    if (this.isWebsite)
        this.permalink_url = response.url;
    else
        this.permalink_url = response.permalink_url;

    this.reactionsCount = 0;
    if (isPropertyExists(response, ["reactions", "summary"]))
        this.reactionsCount = Math.floor(response.reactions.summary.total_count);

    this.commentsCount = 0;
    if (isPropertyExists(response, ["comments", "summary"]))
        this.commentsCount = Math.floor(response.comments.summary.total_count);

    $('#prgLoadReactionsInfo')._k_progressBarValue(0)._k_progressBarMax(this.reactionsCount);
    $('#prgLoadCommentsInfo')._k_progressBarValue(0)._k_progressBarMax(this.commentsCount);

    callback(response);

}

PostLoader.prototype.launchLoaderModal = function (modal, loadReactions, loadComments, loadCompleteCallback) {
    var reactionsLoaded = (this.reactionsLoader.status == 2);
    var commentsLoaded = (this.commentsLoader.status == 2);
    var dataNotLoaded = (loadReactions && !reactionsLoaded || loadComments && !commentsLoaded);
    if (dataNotLoaded == false) {
        // modal.modal("show");
        // setTimeout(new function() { modal.modal("hide"); }, 1400);
        loadCompleteCallback();
        return;
    }

    this.modal = modal;
    this.loadReactions = loadReactions;
    this.loadComments = loadComments;
    this.loadCompleteCallback = loadCompleteCallback;

    var _self = this;
    //    this.modal.on('hidden.bs.modal', function (e) {
    if (_self.loadReactions && _self.reactionsLoader.status == 0) {
        _self.reactionsLoader.api("/" + _self.postId + "/reactions"
            , { limit: '200', fields: 'id,name,type', locale: _self.locale }
            , function (fbApiListLoader) { _self.onLoaderTaskComplete(); }
            , function (fbApiListLoader) { $('#prgLoadReactionsInfo')._k_progressBarValue(fbApiListLoader.resultArray.length); }
        );
    }
    if (_self.loadComments && _self.commentsLoader.status == 0) {
        _self.commentsLoader.api(
            "/" + _self.postId + "/comments"
            , {
                filter: 'stream', limit: '200',
                locale: _self.locale,
                fields: 'id,from,created_time,message,message_tags,attachment,parent,like_count', 'date_format': 'c'
            }
            , function (fbApiListLoader) { _self.onLoaderTaskComplete(); }
            , function (fbApiListLoader) { $('#prgLoadCommentsInfo')._k_progressBarValue(fbApiListLoader.resultArray.length); }
        );
    }
    //	});
    //	buttons: [{text: "숨기기", click:function(){_self.dialog.dialog("close");}}]
    //    });
    this.modal.modal("show");
}

PostLoader.prototype.onLoaderTaskComplete = function () {
    var reactionsLoaded = (this.reactionsLoader.status == 2);
    var commentsLoaded = (this.commentsLoader.status == 2);
    if (reactionsLoaded)
        $('#prgLoadReactionsInfo')._k_progressBarValue(this.reactionsCount);
    if (commentsLoaded)
        $('#prgLoadCommentsInfo')._k_progressBarValue(this.commentsCount);
    var dataNotLoaded = (this.loadReactions && !reactionsLoaded || this.loadComments && !commentsLoaded);
    if (dataNotLoaded == false) {
        this.loadCompleteCallback();
        this.modal.modal("hide");
        return;
    }
}

PostLoader.prototype.getReactionsMap = function () {
    var resultTable = {};
    $.each(this.reactionsLoader.resultArray, function () {
        resultTable[stringify(this["id"])] = { name: this["name"], reaction_type: this["type"] };
    });
    return resultTable;
}

PostLoader.prototype.getTagMap = function () {
    var resultTable = {};
    $.each(this.commentsLoader.resultArray, function () {
        var messageTags = this["message_tags"];
        if (is_defined(messageTags) == false)
            return true;

        if (is_defined(this["from"]) == false)
            return true;
        var commentUserId = stringify(this["from"]["id"]);

        if (is_defined(resultTable[commentUserId]) == false)
            resultTable[commentUserId] = [];

        for (var i = 0; i < messageTags.length; i++) {
            var taggedUserId = stringify(messageTags[i]["id"]);
            if (commentUserId != taggedUserId && resultTable[commentUserId].indexOf(taggedUserId) < 0)
                resultTable[commentUserId].push(taggedUserId);
        }
    });
    return resultTable;
}
