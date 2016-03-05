
// utility functions
jQuery.fn.extend({
    _k_makeHyperLink: function (fn) {
        var ret = this.css("textDecoration", "underline").css("cursor", "pointer");
        if (is_defined(fn))
            ret = ret.click(fn);
        return ret;
    },

    _k_progressBarValue: function (value) {
        var ret = this.attr('aria-valuenow', value);
        recalcProgressBar(this);
        return ret;
    },

    _k_progressBarMax: function (value) {
        var ret = this.attr('aria-valuemax', value);
        recalcProgressBar(this);
        return ret;
    },

    _k_debugVisualizeObj: function (obj) {
        var _tbl = $('<table border=1>');
        this.append(_tbl);

        for (var t in obj) {
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

function recalcProgressBar(progressBar) {
    var result = 0;
    if (progressBar.attr('aria-valuemax') > 0)
        result = Math.floor(progressBar.attr('aria-valuenow') / progressBar.attr('aria-valuemax') * 100);
    progressBar.css('width', result + '%')
    progressBar.text(result + "% (" + progressBar.attr('aria-valuenow') + " / " + progressBar.attr('aria-valuemax') + ")");
}

function decorateMessageWithTags(message, message_tags) {
    var finalMessage = message + "";
    if (message_tags !== undefined) {
        var sortedMessageTags = message_tags.concat();
        sortedMessageTags.sort(function (a, b) { return b["offset"] - a["offset"] });

        var totalOffset = 0;
        for (var i = 0; i < sortedMessageTags.length; i++) {
            var curOffset = sortedMessageTags[i]["offset"];
            var curLength = message_tags[i]["length"];
            var resultHTML = "<a href='http://facebook.com/" + message_tags[i]["id"] + "' target='_blank'>" + message_tags[i]["name"] + "</a>";
            finalMessage = finalMessage.substring(0, curOffset) + resultHTML + finalMessage.substring(curOffset + curLength);
        }
    }
    return finalMessage;
}

function trySetupPost(postId, successCallback, failCallback) {

    if (g_appContext.postLoader !== null)
        g_appContext.postLoader.stop();
    g_appContext.postLoader = new PostLoader();

    if (g_appContext.postDownloaderModal == null) {
        g_appContext.postDownloaderModal = $('#myModal').modal({
            keyboard: false,
            show: false
        });
    }


    g_appContext.postLoader.init(postId, function (response) {

        $('#tblShortSummary').find('tr').remove();
        $('#tblResultTable').find('tr').remove();

        {
            var _tr = $('<tr>').appendTo($('#tblShortSummary'));
            $('<td>').appendTo(_tr).text('Image');
            $('<td>').appendTo(_tr).text('Text').addClass("col-md-6");
        }
        {
            var post_image_td = $('<td>');
            if (is_defined(response.picture))
                post_image_td.append($('<img>').attr('src', response.picture).addClass("img-responsive")).append('<br>');

            var title = stringify(response.message);
            if (is_defined(response.story))
                title = stringify(response.story);
            var post_body_td = $('<td>');
            post_body_td.append($('<span>').text("Likes : " + g_appContext.postLoader.likesCount));
            post_body_td.append($('<br>'));
            post_body_td.append($('<span>').text("Comments : " + g_appContext.postLoader.commentsCount));
            post_body_td.append($('<br>'));
            post_body_td.append($('<br>'));
            post_body_td.append($('<pre>').css('background-color', 'lightyellow').css('white-space', 'pre-line').text(title));

            $('<tr>').appendTo($('#tblShortSummary'))
                .append(post_image_td)
                .append(post_body_td);
        }
        successCallback(response);
    }, failCallback);
}

function post_loadSuccess() {
    switchPage('post');

    $('#divResultButtons').hide();
    $('#alertResultsPlaceholder').show();

}


function getLikes() {
    $('#tblResultTable').find('tr').remove();
    g_appContext.postLoader.launchLoaderModal(g_appContext.postDownloaderModal, true, false, function () {
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

function getComments() {
    $('#tblResultTable').find('tr').remove();
    g_appContext.postLoader.launchLoaderModal(g_appContext.postDownloaderModal, chkLikes.checked, true, function () {
        var results = g_appContext.postLoader.commentsLoader.resultArray;
        $('#tblResultTable').find('tr').remove();

        var resultArray = [];
        for (var i = 0; i < results.length; i++) {
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

function getCommentsHtml(commentsArray, likesMap, isShowAttachment, isShowLikes, isShowCommentLink) {
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

    for (var i = 0; i < commentsArray.length; i++) {
        var attachmentTd = "";
        if (isShowAttachment) {
            attachmentTd = "<td>&nbsp;</td>";
            if (commentsArray[i]["attachmentUrl"] != "") {
                attachmentTd = String.format("<td height='150' sorttable_customkey='1'><a href='{0}' target='_blank'><img src='{1}' height='150'></a></td>",
                    commentsArray[i]["attachmentUrl"], commentsArray[i]["attachmentImage"]);
            }
        }

        var tdLikes = "";
        if (isShowLikes) {
            tdLikes = "<td>&nbsp;</td>";
            if (likesMap[commentsArray[i]["id"]] !== undefined)
                tdLikes = "<td>Like!</td>";
        }

        var tdCommentLink = "";
        if (isShowCommentLink) {
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

function parseAttachmentUrl(attachment) {
    var result = { "url": "", "image": "" };
    if (isPropertyExists(attachment, ["url"]) &&
        isPropertyExists(attachment, ["media", "image", "src"])) {
        result["url"] = attachment["url"];
        result["image"] = attachment["media"]["image"]["src"];
    }
    return result;
}

function tryGetMangePosts(response) {
    if (checkRequiredScopeGranted(response) == false)
        return;
    g_appContext.grantedScopes = response.authResponse.grantedScopes;
    if (isPermGranted('pages_show_list'))
        refreshLikedPages(true);
}

function wireEvents_post() {
    $("#prgLoadLikesInfo")._k_progressBarValue(0);
    $("#prgLoadCommentsInfo")._k_progressBarValue(0);
    $('#btnLoadSummary').click(function () { getLikes(); });
    $('#btnLoadLikes').click(function () { getLikes(); });
    $('#btnLoadComments').click(function () { getComments(); });
    $('#btnExportResultTable').click(function () { tableToExcel(tblResultTable.outerHTML, 'Results', 'results_pagepostmanager.xls'); });
    $('#btnShowResultTable').click(function () { $('#tblResultTable').removeClass('hidden'); });
}