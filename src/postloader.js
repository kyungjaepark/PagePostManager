function PostLoader() {
	this.reset();
}

PostLoader.prototype.reset = function()
{
	this.likesLoader = new FbApiListLoader();
	this.commentsLoader = new FbApiListLoader();
	this.postId = 0;
	this.likesCount = 0;
	this.commentsCount = 0;
	this.loadLikes=false;
	this.loadComments=false;
	this.loadCompleteCallback=function(){};
	this.dialog=null;
	this.modal=null;
}

PostLoader.prototype.stop = function()
{
	this.likesLoader.stop();
	this.commentsLoader.stop();
}

PostLoader.prototype.init = function(postId, callback)
{
	this.postId = postId;
	var apiString = "/" + this.postId + "?fields=id,icon,message,picture,likes.summary(1).limit(1),comments.summary(1).limit(1)";
	var _self = this;
	FB.api(apiString, function(response){_self.parseSummary(response, callback);});
}

PostLoader.prototype.parseSummary = function(response, callback)
{
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

PostLoader.prototype.launchLoaderModal = function (modal, loadLikes, loadComments, loadCompleteCallback)
{
	var likesLoaded = (this.likesLoader.status == 2);
	var commentsLoaded = (this.commentsLoader.status == 2);
	var dataNotLoaded = (loadLikes && !likesLoaded || loadComments && !commentsLoaded);
	if (dataNotLoaded == false)
	{
		loadCompleteCallback();
		return;
	}	
		
	this.modal = modal;
	this.loadLikes = loadLikes;
	this.loadComments = loadComments;
	this.loadCompleteCallback = loadCompleteCallback;
	
	var _self= this;
//    this.modal.on('hidden.bs.modal', function (e) {
		if (_self.loadLikes && _self.likesLoader.status == 0)
		{
			_self.likesLoader.api("/" + _self.postId + "/likes?limit=200"
				, function(fbApiListLoader){_self.onLoaderTaskComplete();}
				, function(fbApiListLoader){$('#prgLoadLikesInfo')._k_progressBarValue(fbApiListLoader.resultArray.length);}
			);
		}
		if (_self.loadComments && _self.commentsLoader.status == 0)
		{
			var _api = "/" + _self.postId + "/comments?filter=stream&fields=id,from,created_time,message,message_tags,attachment,parent,like_count&date_format=c&limit=200";
			_self.commentsLoader.api(_api
				, function(fbApiListLoader){_self.onLoaderTaskComplete();}
				, function(fbApiListLoader){$('#prgLoadCommentsInfo')._k_progressBarValue(fbApiListLoader.resultArray.length);}
			);
		}
//	});
//	buttons: [{text: "숨기기", click:function(){_self.dialog.dialog("close");}}]
//    });
    this.modal.modal("show");
}

PostLoader.prototype.onLoaderTaskComplete = function()
{
	var likesLoaded = (this.likesLoader.status == 2);
	var commentsLoaded = (this.commentsLoader.status == 2);
	if (likesLoaded)
		$('#prgLoadLikesInfo')._k_progressBarValue(this.likesCount);
	if (commentsLoaded)
		$('#prgLoadCommentsInfo')._k_progressBarValue(this.commentsCount);
	var dataNotLoaded = (this.loadLikes && !likesLoaded || this.loadComments && !commentsLoaded);
	if (dataNotLoaded == false)
	{
		this.loadCompleteCallback();
	    this.modal.modal("hide");
		return;
	}
}

PostLoader.prototype.getLikesMap = function()
{
	var resultTable = {};
	$.each(this.likesLoader.resultArray, function(){
		resultTable[stringify(this["id"])] = this["name"];
	});
	return resultTable;
}
