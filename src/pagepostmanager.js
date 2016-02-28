
// app config
var g_appConfig =
{
	requiredScopes: [ ],
	appId: '624861190962222'
}

var g_appContext = 
{
	initialized: false,
	selectedPageId: 0,
	postLoader:null,
	downloaderModal: null,
	grantedScopes: [],
	isGroupSearchMode: false,
};

// http://stackoverflow.com/questions/1744310/how-to-fix-array-indexof-in-javascript-for-internet-explorer-browsers
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
         for (var i = (start || 0), j = this.length; i < j; i++) {
             if (this[i] === obj) { return i; }
         }
         return -1;
    }
}

function isPermGranted(permission)
{
	return (is_defined(g_appContext.grantedScopes) && g_appContext.grantedScopes.indexOf(permission) >= 0);
}

function recalcProgressBar(progressBar)
{
	var result = 0;
	if (progressBar.attr('aria-valuemax') > 0)
		result = Math.floor(progressBar.attr('aria-valuenow') / progressBar.attr('aria-valuemax') * 100);
	progressBar.css('width', result+'%')
	progressBar.text(result + "% (" + progressBar.attr('aria-valuenow') + " / " + progressBar.attr('aria-valuemax') + ")");
}

// utility functions
jQuery.fn.extend({
	_k_makeHyperLink: function(fn) {
		var ret = this.css("textDecoration", "underline").css("cursor", "pointer");
		if (is_defined(fn))
			ret = ret.click(fn);
		return ret;
	},
	
	_k_progressBarValue: function(value) {
		var ret = this.attr('aria-valuenow', value);
		recalcProgressBar(this);
		return ret;
	},
	
	_k_progressBarMax: function(value) {
		var ret = this.attr('aria-valuemax', value);
		recalcProgressBar(this);
		return ret;
	},
	
	_k_debugVisualizeObj: function(obj) {
		var _tbl = $('<table border=1>');
		this.append(_tbl);

		for (var t in obj)
		{
			var _tr = $('<tr>');
			_tbl.append(_tr);
			
			_tr.append($('<td>').text(t));
			var _valueTd = $('<td>');
			_tr.append(_valueTd);
			if (typeof obj[t] == "object")
				_valueTd._k_debugVisualizeObj(obj[t]);
			else
				_valueTd.text(obj[t]);
		}
		return this;
	}
});

// http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
// First, checks if it isn't implemented yet.
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}

function is_defined(obj)
{
	return (typeof obj !== 'undefined');
}

function stringify(obj)
{
	if (is_defined(obj) && obj !== null)
		return new String(obj);
	return "";
}

// example : isPropertyExists(response, ["paging", "next"]);
function isPropertyExists(obj, propList)
{
	for (var i = 0; i < propList.length; i++)
	{
		if (is_defined(obj) == false)
			return false;
		obj = obj[propList[i]];
		if (is_defined(obj) == false)
			return false;
	}
	return true;
}

function decorateMessageWithTags(message, message_tags)
{
	var finalMessage = message + "";
	if (message_tags !== undefined)
	{
		var sortedMessageTags = message_tags.concat();
		sortedMessageTags.sort(function(a,b){return b["offset"] - a["offset"]});

		var totalOffset = 0;
		for(var i = 0; i < sortedMessageTags.length; i++)
		{
			var curOffset = sortedMessageTags[i]["offset"];
			var curLength = message_tags[i]["length"];
			var resultHTML = "<a href='http://facebook.com/" + message_tags[i]["id"] + "' target='_blank'>" + message_tags[i]["name"] + "</a>";
			finalMessage = finalMessage.substring(0, curOffset) + resultHTML + finalMessage.substring(curOffset + curLength);
		}
	}
	return finalMessage;
}

function getDateTimeString(dateTime)
{
	return String.format("{0}-{1}-{2} {3}:{4}:{5}"
		, dateTime.getFullYear()
		, dateTime.getMonth() + 1
		, dateTime.getDate()
		, dateTime.getHours()
		, dateTime.getMinutes()
		, dateTime.getSeconds()
	);
}

http://stackoverflow.com/questions/17126453/html-table-to-excel-javascript
var tableToExcel = (function () {
        var uri = 'data:application/vnd.ms-excel;charset=UTF-8;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' + 
        	'<head><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>' +
        	'<body>{table_outer_html}</body></html>'
        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        return function (tableouterHTML, name, filename) {
            var ctx = { worksheet: name || 'Worksheet', table_outer_html: tableouterHTML }

			// try blob first http://stackoverflow.com/questions/20048399/is-there-any-way-to-export-html-table-into-excel-working-in-all-browsers
			window.URL = window.URL || window.webkitURL;
			var blob = new Blob([format(template, ctx)]);
			var blobURL = window.URL.createObjectURL(blob);
			if (blobURL) {
				$("#dlink")
				.attr("href", blobURL)
				.attr("download", filename)
				document.getElementById("dlink").click();
				return;
			}
            document.getElementById("dlink").href = uri + base64(format(template, ctx));
            document.getElementById("dlink").download = filename;
            document.getElementById("dlink").click();

        }
    })()


// facebook basic init
window.fbAsyncInit = function() {
	FB.init({
		appId: g_appConfig.appId,
		version: 'v2.5'
	});
	
	$('#shareBox').html('<div class="fb-like" data-href="http://kyungjaepark.com/pagepostmanager" data-layout="standard" data-action="like" data-show-faces="true" data-share="true"></div>');
	FB.XFBML.parse(document.getElementById('shareBox'));
};

// fb init
(function(d, s, id){var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) {return;}js = d.createElement(s); js.id = id;js.src = "//connect.facebook.net/en_US/sdk.js";fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'facebook-jssdk'));

function getRequiredScope()
{
	return g_appConfig.requiredScopes.join(",");
}

function checkRequiredScopeGranted(response)
{
	if (response.status !== 'connected')
		return false;
		
	for (var i = 0; i < g_appConfig.requiredScopes.length; i++)
		if (response.authResponse.grantedScopes.indexOf(g_appConfig.requiredScopes[i]) < 0)
			return false;
	
	return true;
}

function checkFbLogin(response)
{
	g_appContext.grantedScopes = response.authResponse.grantedScopes;
	if (checkRequiredScopeGranted(response) == false)
	{
		$('#alertLoginFail').show();
		return;
	}
	startApp();
}

function tryFbLogin()
{
	$('#alertLoginFail').hide();
	FB.login(checkFbLogin, { scope: getRequiredScope(), return_scopes: true }); 
}

function startApp()
{
	$('#divWelcome').hide();
	$('#divMain').show();

	if (g_appContext.initialized)
		return;
		
	FB.api("/me", function(response) {$('#lblName').text(response.name);});
		
	//refreshLikedPages(true);
	g_appContext.initialized = true;
}

// page list
function refreshLikedPages(isAdmin)
{
	if (isAdmin)
		startRequestPageList('/me/accounts', {}, false);
	else
		startRequestPageList('/me/likes', {}, false);
}

// isPages : {true=page|false=group}
function refreshBySearch(searchString, isGroup)
{
	if (searchString == "")
		return;

	startRequestPageList('/search', { q: searchString, type: isGroup ? 'group' : 'page' }, isGroup);
}

function startRequestPageList(apiPrefix, param, isGroup)
{
	g_appContext.isGroupSearchMode = isGroup;
	param["fields"] = "id,name,picture,likes,category,about,description,general_info,is_verified,username,members.summary(true)";
	
	$('#tblLikedPages tr:gt(0)').remove();
	var _api = apiPrefix + '?' + jQuery.param(param);
	FB.api(_api, function(response) {processPageListResult(response);});
}

function processPageListResult(response)
{
	$('#tblLikedPages').dataTable().fnDestroy();
	$('#tblLikedPages tr:gt(0)').remove();
	$('#pnlPageSearch').show();
	
	$.each(response.data, function(){
		var curRow = $('<tr>').addClass("ex-hand-cursor")
			.click(onPageSelection)
			.attr('pageId', this.id)
			.attr('pageName', this.name)
			.attr('pageOrGroup', g_appContext.isGroupSearchMode ? "group" : "page");
		curRow.appendTo($('#tblLikedPages'));
		curRow.append($('<td>').append($('<img>').attr('src', this.picture.data.url)));

		var nameTd = $('<td>');
		curRow.append(nameTd);
		nameTd.append($('<span>').html(this.name));

		if (g_appContext.isGroupSearchMode)
		{
			curRow.append($('<td>').text(this.members.summary.total_count));
			curRow.append($('<td>').text(this.description));
		}
		else{
		if (this.is_verified)
			nameTd.append($('<img>').attr('src', 'verified.png'));
			nameTd.append($('<span>').html('<br/>' + this.category + '<br/>By : ' + this.username));
			curRow.append($('<td>').text(this.likes));
			curRow.append($('<td>').text(this.about));
		}
		//curRow.append($('<td>').text(this.description));
		//curRow.append($('<td>').text(this.general_info));
	});

	$("#tblLikedPages").dataTable({ paging: false, searching: false, info: false });

//	sorttable.makeSortable(tblLikedPages);

	$('#btnPageListPrev').attr('disabled', true);
	$('#btnPageListNext').attr('disabled', true);
	if (is_defined(response.paging))
	{
		if (is_defined(response.paging.previous))
		{
			$('#btnPageListPrev').attr('api', response.paging.previous);
			$('#btnPageListPrev').attr('disabled', false);
		}
		if (is_defined(response.paging.next))
		{
			$('#btnPageListNext').attr('api', response.paging.next);
			$('#btnPageListNext').attr('disabled', false);
		}
	}
}

function onPageListPaging()
{
	FB.api($(this).attr('api'), function(response) {
		processPageListResult(response);
	});
}

function onPageSelection()
{
	g_appContext.selectedPageId = $(this).attr('pageId');
	$('#txtSelectedPage').text($(this).attr('pageName'));
	
	$('#myTab a[href="#tabsPosts"]').tab('show');
	$('#alertNoPosts').hide();
	$('#tblPostList').find('tr').remove();
	$('#tabsPostsBody').show();
	
	$('#alertNoPages').show();
	$('#tabsDetailBody').hide();

	var isGroup = ($(this).attr('pageOrGroup') == "group");
	FB.api("/" + g_appContext.selectedPageId + "/" + (isGroup ? "feed" : "posts") + "?fields=id,from,admin_creator,icon,message,story,picture,likes.summary(1).limit(1),status_type", function(response) {
		processPostListResult(response);
	});
}

// select post from page post list
function processPostListResult(response)
{
	$('#tblPostList').find('tr').remove();
	$('#tblPostList').css("table-layout", "fixed");
	$('#tblPostList').addClass("f11");
	$.each(response.data, function(){
		var postListRow = $('<tr>');
		$('#tblPostList').append(postListRow);
		
		var postListItem = null;

		postListItem = $('<td>').appendTo(postListRow);
		postListItem.append($('<img>').attr('src', this.picture).addClass("img-responsive")).addClass("col-md-2");

		postListItem = $('<td>').appendTo(postListRow);
		postListItem.addClass("ex-hand-cursor").click(onPostSelection);
        

		var header = "[?]";
		if (is_defined(this.from))
            header = this.from.name;

        var bodytext = stringify(this.message);
		if (bodytext == "")
			if (is_defined(this.story))
				bodytext = this.story;
		
        postListItem.append($('<span>').text(header + ' ').css('font-weight','bold'));
        postListItem.append($('<span>').text('(' + this.likes.summary.total_count + ' Likes) '));
        
		var articleLink = $('<a>').text("[post link]")
			.attr('href', "https://facebook.com/" + this.id.replace('_', '/posts/'))
			.attr('target', '_blank');
		postListItem.append(articleLink);
        postListItem.append($('<br/>'));
        postListItem.append($('<span>').text(bodytext).css('white-space', 'pre'));
		postListItem.attr('postId', this.id).addClass("ex-overflowtd").addClass("col-md-8");


	});
	
	$('#btnPostListPrev').attr('disabled', true);
	$('#btnPostListNext').attr('disabled', true);
	if (is_defined(response.paging))
	{
		if (is_defined(response.paging.previous))
		{
			$('#btnPostListPrev').attr('api', response.paging.previous);
			$('#btnPostListPrev').attr('disabled', false);
		}
		if (is_defined(response.paging.next))
		{
			$('#btnPostListNext').attr('api', response.paging.next);
			$('#btnPostListNext').attr('disabled', false);
		}
	}
}

function onPostSelection()
{
	selectPost($(this).attr('postId'));
}

function onPostListPaging()
{
	FB.api($(this).attr('api'), function(response) {
		processPostListResult(response);
	});
}

// handle each post
function selectPost(postId)
{
	$('#alertNoPages').hide();

	$('#txtSelectedFeed').text("temp");
	$('#txtFeedBrief').html("");
	
	$('#divResultButtons').hide();
	$('#alertResultsPlaceholder').show();

	$('#tblShortSummary').find('tr').remove();
	$('#tblResultTable').find('tr').remove();

	$('#tabsDetailBody').show();
	$('#myTab a[href="#tabsDetail"]').tab('show');

	if (g_appContext.postLoader !== null)
		g_appContext.postLoader.stop();
	g_appContext.postLoader = new PostLoader();
	g_appContext.postLoader.init(postId, function(response) {
	
		{
			var _tr = $('<tr>').appendTo($('#tblShortSummary'));
			$('<td>').appendTo(_tr).text('Likes');
			$('<td>').appendTo(_tr).text('Comments');
			$('<td>').appendTo(_tr).text('Image');
			$('<td>').appendTo(_tr).text('Text').addClass("col-md-6");
		}
		{
			var _tr = $('<tr>').appendTo($('#tblShortSummary'));
			$('<td>').appendTo(_tr).text(g_appContext.postLoader.likesCount);
			$('<td>').appendTo(_tr).text(g_appContext.postLoader.commentsCount);

			var _td2 = $('<td>').appendTo(_tr);
			if (is_defined(response.picture))
				_td2.append($('<img>').attr('src', response.picture).addClass("img-responsive")).append('<br>');

			var title = stringify(response.message);
			if (is_defined(response.story))
				title = stringify(response.story);
			$('<td>').appendTo(_tr).text(title);
		}
	});
}

function getLikes()
{
	$('#tblResultTable').find('tr').remove();
	g_appContext.postLoader.launchLoaderModal(g_appContext.downloaderModal, true, false, function()
	{
		var likesMap = g_appContext.postLoader.getLikesMap();
		var stringBuilder = [];
		stringBuilder.push("<tr><th>ID</th><th>이름</th></tr>");
		for (var x in likesMap)
			stringBuilder.push(String.format("<tr><td style='mso-number-format:\"\\@\"'>{0}</td><td><a href='http://facebook.com/{0}' target='_blank'>{1}</a></td></tr>", x, likesMap[x]));
		$('#tblResultTable').addClass('hidden');
        tblResultTable.innerHTML = stringBuilder.join("");
		sorttable.makeSortable(tblResultTable);
		$('#divResultButtons').show();
		$('#alertResultsPlaceholder').hide();
	});
}

function getComments()
{
	$('#tblResultTable').find('tr').remove();
	g_appContext.postLoader.launchLoaderModal(g_appContext.downloaderModal, chkLikes.checked, true, function()
	{
		var results = g_appContext.postLoader.commentsLoader.resultArray;
		$('#tblResultTable').find('tr').remove();

		var resultArray = [];
		for (var i = 0; i < results.length; i++)
		{
			var curResult = results[i];
			var eachResult = {};
			eachResult["id"] = curResult["from"]["id"];
			eachResult["name"] = curResult["from"]["name"];
			eachResult["time"] = getDateTimeString(new Date(curResult["created_time"]));
			eachResult["timeRaw"] = curResult["created_time"];
			eachResult["htmlMessage"] = decorateMessageWithTags(curResult["message"], curResult["message_tags"]);
			eachResult["link"] = "#";
			var commentLinkArray = curResult["id"].split("_");
			if (commentLinkArray.length == 2)
				eachResult["link"] = String.format("https://www.facebook.com/{0}?comment_id={1}",
					commentLinkArray[0], commentLinkArray[1]);
			eachResult["commentLikes"] = curResult["like_count"];
			eachResult["attachmentUrl"] = parseAttachmentUrl(curResult["attachment"])["url"];
			eachResult["attachmentImage"] = parseAttachmentUrl(curResult["attachment"])["image"];
			eachResult["json"] = JSON.stringify(curResult);
			resultArray.push(eachResult);
		}

		var likesMap = {};
		if (chkLikes.checked)
			likesMap = g_appContext.postLoader.getLikesMap();

		$('#tblResultTable').addClass('hidden');
		tblResultTable.innerHTML = getCommentsHtml(resultArray, likesMap, chkShowAttachment.checked, chkLikes.checked, chkCommentLink.checked);
		sorttable.makeSortable(tblResultTable);
		$('#divResultButtons').show();
		$('#alertResultsPlaceholder').hide();
	});
}

function getCommentsHtml(commentsArray, likesMap, isShowAttachment, isShowLikes, isShowCommentLink)
{
	var stringBuilder = [];
	stringBuilder.push("<tr>");
	if (isShowLikes)
		stringBuilder.push("<td>PostLike!</td>");
	stringBuilder.push("<td>ID</td>");
	if (isShowCommentLink)
		stringBuilder.push("<td>Link</td>");
	stringBuilder.push("<td>Name</td><td>Date</td><td>Text</td>");
	stringBuilder.push("<td>Likes Count</td>");
	if (isShowAttachment)
		stringBuilder.push("<td>Images</td>");
	stringBuilder.push("</tr>");

	for (var i = 0; i < commentsArray.length; i++)
	{
		var attachmentTd = "";
		if (isShowAttachment)
		{
			attachmentTd = "<td>&nbsp;</td>";
			if (commentsArray[i]["attachmentUrl"] != "")
			{
				attachmentTd = String.format("<td height='150' sorttable_customkey='1'><a href='{0}' target='_blank'><img src='{1}' height='150'></a></td>",
						commentsArray[i]["attachmentUrl"], commentsArray[i]["attachmentImage"]);
			}
		}
		
		var tdLikes = "";
		if (isShowLikes)
		{
			tdLikes = "<td>&nbsp;</td>";
			if (likesMap[commentsArray[i]["id"]] !== undefined)
				tdLikes = "<td>Like!</td>";
		}
		
		var tdCommentLink = "";
		if (isShowCommentLink)
		{
			tdCommentLink = '<td><a href="' + commentsArray[i]["link"] + '" target="_blank">Link</a></td>';
		}
		stringBuilder.push(
			String.format("<tr>" +
				"{5}" +
				"<td style='mso-number-format:\"\\@\"'>{0}</td>" +
				"{8}" +
				"<td><a href='http://facebook.com/{0}' target='_blank'>{1}</a></td>" +
				"<td width='200' sorttable_customkey='{6}'>{2}</td>" +
				"<td>{3}</td>" +
				"<td>{7}</td>" +
				"{4}" +
				"</tr>"
				, commentsArray[i]["id"] 
				, commentsArray[i]["name"]
				, commentsArray[i]["time"]
				, commentsArray[i]["htmlMessage"]
				, attachmentTd
				, tdLikes
				, commentsArray[i]["timeRaw"]
				, commentsArray[i]["commentLikes"]
				, tdCommentLink
			)
		);
	}
	return stringBuilder.join("");
}

function parseAttachmentUrl(attachment)
{
	var result = {"url":"", "image":""};
	if (isPropertyExists(attachment, ["url"]) &&
		isPropertyExists(attachment, ["media", "image", "src"]))
	{
		result["url"] = attachment["url"];
		result["image"] = attachment["media"]["image"]["src"];
	}
	return result;
}

function tryGetMangePosts(response)
{
	if (checkRequiredScopeGranted(response) == false)
		return;
	g_appContext.grantedScopes = response.authResponse.grantedScopes;
	if (isPermGranted('pages_show_list'))
		refreshLikedPages(true);
}

function onBtnPagesAdminRefreshClick()
{
	if (isPermGranted('pages_show_list') == false)
		FB.login(tryGetMangePosts, { scope: ['pages_show_list'], return_scopes: true }); 
	else
		refreshLikedPages(true);
}

function onBtnGroupsAdminRefreshClick()
{
	alert('그룹 관리 기능은 준비 중입니다.');
	//if (isPermGranted('pages_show_list') == false)
	//	FB.login(tryGetMangePosts, { scope: ['pages_show_list'], return_scopes: true }); 
	//refreshLikedPages(true);
}

function getParamMap()
{
	var ret = {};
	var searchStr = window.location.search;
	if (searchStr.length < 2)
	{
		return ret;
	}
	var paramArray = searchStr.substring(1).split('&');
	$.each(paramArray, function(){
		var nameValue = this.split('=');
		ret[nameValue[0]] = nameValue[1];
	});
	return ret;
}

// main
function main()
{
	$('#btnStart').click(tryFbLogin);
	$('#btnPageListPrev').click(onPageListPaging);
	$('#btnPageListNext').click(onPageListPaging);

	$('#btnPostListPrev').click(onPostListPaging);
	$('#btnPostListNext').click(onPostListPaging);
	
	$("#prgLoadLikesInfo")._k_progressBarValue(0);
	$("#prgLoadCommentsInfo")._k_progressBarValue(0);
	
	$('#btnPagesAdminRefresh').click(onBtnPagesAdminRefreshClick);
	$('#btnPagesLikesRefresh').click(function(){refreshLikedPages(false);});
	$('#btnPagesSearchRefresh').click(function(){refreshBySearch($('#txtSearch').val(), false);});

	$('#btnGroupsAdminRefresh').click(onBtnGroupsAdminRefreshClick);
	$('#btnGroupsSearchRefresh').click(function(){refreshBySearch($('#txtSearchGroup').val(), true);});
	
	$('#btnLoadSummary').click(function(){getLikes();});
	$('#btnLoadLikes').click(function(){getLikes();});
	$('#btnLoadComments').click(function(){getComments();});

	$('#btnExportResultTable').click(function(){tableToExcel(tblResultTable.outerHTML, 'Results', 'results_pagepostmanager.xls');});
	$('#btnShowResultTable').click(function(){$('#tblResultTable').removeClass('hidden');});
    

	$('#tabsPostsBody').hide();
	$('#tabsDetailBody').hide();
	
	$('#alertLoginFail').hide();
	$('#divMain').hide();
	
	$('#pnlPageSearch').hide();
	
	$('#btnChoosePage').click(function(e){e.preventDefault(); $('#myTab a[href="#tabsPages"]').tab('show');});
	$('#btnChoosePost').click(function(e){e.preventDefault(); $('#myTab a[href="#tabsPosts"]').tab('show');});
	
	$("#txtSearch").keyup(function(event){if(event.keyCode == 13) {$("#btnPagesSearchRefresh").click();} });
	$("#txtSearchGroup").keyup(function(event){if(event.keyCode == 13) {$("#btnGroupsSearchRefresh").click();} });
	$("#tblLikedPages").dataTable({ paging: false, searching: false, info: false });

	var locale = getParamMap()['lang'];
	if (is_defined(locale) == false)
		locale = window.navigator.userLanguage || window.navigator.language;
	new SimpleTranslator().translate(locale);

	g_appContext.downloaderModal = $('#myModal').modal({
		keyboard: false,
		show: false
	});
}

$().ready( function() { main(); } );
