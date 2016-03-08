function FbApiListLoader() {
	this.reset();
}

FbApiListLoader.prototype.reset = function(){
	this.status = 0;
	this.resultArray = [];
	this.onLoadComplete = function(){};
	this.onProgress = function(){};
}

FbApiListLoader.prototype.api = function(apiString, param, onLoadCompleteFn, onProgressFn){

	this.status = 1;
	
	if (is_defined(onLoadCompleteFn))
		this.onLoadComplete = onLoadCompleteFn;
	if (is_defined(onProgressFn))
		this.onProgress = onProgressFn;
		
	this.resultArray = [];
	var _self = this;
	FB.api(apiString, param, function(response){_self.parse(response);});
}

FbApiListLoader.prototype.stop = function(){
	if (this.status == 1)
		this.status = 0;
}

FbApiListLoader.prototype.parse = function(response){
	if (this.status != 1)
		return;
		
	if (is_defined(response["data"]))
		this.resultArray = this.resultArray.concat(response["data"]);
	
	this.onProgress(this);
	
	if (isPropertyExists(response, ["paging", "next"]))
	{
		var _self = this;
		FB.api(response["paging"]["next"], function(response){_self.parse(response)});
		return;
	}

	this.status = 2;
	this.onLoadComplete(this);
}
