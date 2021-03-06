function PostLoader() {
    this.reset();
}

PostLoader.prototype.reset = function() {
    this.likesLoader = new FbApiListLoader();
    this.commentsLoader = new FbApiListLoader();
    this.postId = 0;
    this.permalink_url = '';
    this.likesCount = 0;
    this.commentsCount = 0;
    this.loadLikes = false;
    this.loadComments = false;
    this.loadCompleteCallback = function() { };
    this.dialog = null;
    this.modal = null;
    this.locale = 'en_US';
}

PostLoader.prototype.stop = function() {
    this.likesLoader.stop();
    this.commentsLoader.stop();
}

PostLoader.prototype.init = function(postId, locale, successCallback, failCallback) {
    this.postId = postId;
    this.locale = locale;
    var _self = this;
    FB.api(
        "/" + this.postId,
        { 'fields': 'id,permalink_url,from,admin_creator,icon,message,updated_time,story,picture,likes.summary(1).limit(1),comments.filter(stream).summary(1).limit(1),status_type',
    locale: this.locale },
        function(response) {
            if (is_defined(response.error) && is_defined(failCallback)) {
                failCallback(response);
                return;
            }
            _self.parseSummary(response, successCallback);
        });
}

PostLoader.prototype.parseSummary = function(response, callback) {
    this.permalink_url = response.permalink_url;
    
    this.likesCount = 0;
    if (isPropertyExists(response, ["likes", "summary"]))
        this.likesCount = Math.floor(response.likes.summary.total_count);

    this.commentsCount = 0;
    if (isPropertyExists(response, ["comments", "summary"]))
        this.commentsCount = Math.floor(response.comments.summary.total_count);

    $('#prgLoadLikesInfo')._k_progressBarValue(0)._k_progressBarMax(this.likesCount);
    $('#prgLoadCommentsInfo')._k_progressBarValue(0)._k_progressBarMax(this.commentsCount);

    callback(response);

}

PostLoader.prototype.launchLoaderModal = function(modal, loadLikes, loadComments, loadCompleteCallback) {
    var likesLoaded = (this.likesLoader.status == 2);
    var commentsLoaded = (this.commentsLoader.status == 2);
    var dataNotLoaded = (loadLikes && !likesLoaded || loadComments && !commentsLoaded);
    if (dataNotLoaded == false) {
        modal.modal("show");
        setTimeout(new function() { modal.modal("hide"); }, 1400);
        loadCompleteCallback();
        return;
    }

    this.modal = modal;
    this.loadLikes = loadLikes;
    this.loadComments = loadComments;
    this.loadCompleteCallback = loadCompleteCallback;

    var _self = this;
    //    this.modal.on('hidden.bs.modal', function (e) {
    if (_self.loadLikes && _self.likesLoader.status == 0) {
        _self.likesLoader.api("/" + _self.postId + "/likes"
            , { limit: '200', fields: 'id,name', locale: _self.locale }
            , function(fbApiListLoader) { _self.onLoaderTaskComplete(); }
            , function(fbApiListLoader) { $('#prgLoadLikesInfo')._k_progressBarValue(fbApiListLoader.resultArray.length); }
        );
    }
    if (_self.loadComments && _self.commentsLoader.status == 0) {
        _self.commentsLoader.api(
            "/" + _self.postId + "/comments"
            , { filter: 'stream', limit: '200',
            locale: _self.locale,
             fields: 'id,from,created_time,message,message_tags,attachment,parent,like_count', 'date_format': 'c' }
            , function(fbApiListLoader) { _self.onLoaderTaskComplete(); }
            , function(fbApiListLoader) { $('#prgLoadCommentsInfo')._k_progressBarValue(fbApiListLoader.resultArray.length); }
        );
    }
    //	});
    //	buttons: [{text: "숨기기", click:function(){_self.dialog.dialog("close");}}]
    //    });
    this.modal.modal("show");
}

PostLoader.prototype.onLoaderTaskComplete = function() {
    var likesLoaded = (this.likesLoader.status == 2);
    var commentsLoaded = (this.commentsLoader.status == 2);
    if (likesLoaded)
        $('#prgLoadLikesInfo')._k_progressBarValue(this.likesCount);
    if (commentsLoaded)
        $('#prgLoadCommentsInfo')._k_progressBarValue(this.commentsCount);
    var dataNotLoaded = (this.loadLikes && !likesLoaded || this.loadComments && !commentsLoaded);
    if (dataNotLoaded == false) {
        this.loadCompleteCallback();
        this.modal.modal("hide");
        return;
    }
}

PostLoader.prototype.getLikesMap = function() {
    var resultTable = {};
    $.each(this.likesLoader.resultArray, function() {
        resultTable[stringify(this["id"])] = this["name"];
    });
    return resultTable;
}
