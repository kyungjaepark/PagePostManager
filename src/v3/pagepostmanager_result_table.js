function decorateMessageWithTags(message, message_tags) {
    var finalMessage = message + "";
    if (message_tags !== undefined) {
        var sortedMessageTags = message_tags.concat();
        sortedMessageTags.sort(function (a, b) { return b["offset"] - a["offset"] });

        var totalOffset = 0;
        for (var i = 0; i < sortedMessageTags.length; i++) {
            var curOffset = sortedMessageTags[i]["offset"];
            var curLength = sortedMessageTags[i]["length"];
            var resultHTML = "<a href='http://facebook.com/" + sortedMessageTags[i]["id"] + "' target='_blank'>"
                + UnicodeSubstring.substring(finalMessage, curOffset, curOffset + curLength) // sortedMessageTags[i]["name"]
                + "</a>";
            finalMessage = UnicodeSubstring.substring(finalMessage, 0, curOffset)
                + resultHTML
                + UnicodeSubstring.substring(finalMessage, curOffset + curLength, finalMessage.length);
        }
    }
    return finalMessage;
}

function getTaggedUserCount(commentUserId, message_tags) {
    if (is_defined(message_tags) == false)
        return 0;
    var tagList = [commentUserId];
    for (var i = 0; i < message_tags.length; i++) {
        var taggedUserId = message_tags[i]["id"];
        if (tagList.indexOf(taggedUserId) < 0)
            tagList.push(taggedUserId);
    }
    return tagList.length - 1;
}

function generateReactionsHtml(reactionsMap) {
    var stringBuilder = [];
    stringBuilder.push("<tr><th>ID</th><th>이름</th><th>반응</th></tr>");
    for (var x in reactionsMap)
        stringBuilder.push(String.format("<tr><td style='mso-number-format:\"\\@\"'>{0}</td><td><a href='http://facebook.com/{0}' target='_blank'>{1}</a></td><td>{2}</td></tr>", x, reactionsMap[x]['name'], reactionsMap[x]['reaction_type']));
    return stringBuilder.join("");
}

var getCommentsHtml_errorCount = 0;
function getCommentsHtml(results, reactionsMap, isShowAttachment, isShowReactions, isShowCommentLink, isSkipUnknownUser, isShowTopInfo, tagMap) {
    getCommentsHtml_errorCount = 0;
    var commentsArray = [];
    for (var i = 0; i < results.length; i++) {
        var curResult = results[i];
        var eachResult = {};
        if (is_defined(curResult["from"]) == false) {
            if (isSkipUnknownUser)
                continue;
            eachResult["id"] = "(Error)";
            eachResult["name"] = "(Error)";
            getCommentsHtml_errorCount++;
        }
        else {
            eachResult["id"] = curResult["from"]["id"];
            eachResult["name"] = curResult["from"]["name"];
        }
        eachResult["time"] = moment(curResult["created_time"]).format('YYYY-MM-DD HH:mm:ss');
        eachResult["timeRaw"] = curResult["created_time"];
        eachResult["htmlMessage"] = decorateMessageWithTags(curResult["message"], curResult["message_tags"]);
        eachResult["link"] = String.format("https://www.facebook.com/{0}", curResult["id"]);
        eachResult["commentLikes"] = curResult["like_count"];
        eachResult["attachmentUrl"] = parseAttachmentUrl(curResult["attachment"])["url"];
        eachResult["attachmentImage"] = parseAttachmentUrl(curResult["attachment"])["image"];
        eachResult["json"] = JSON.stringify(curResult);
        eachResult["taggedUserCountInComment"] = getTaggedUserCount(eachResult["id"], curResult["message_tags"]);
        eachResult["taggedUserCountInPost"] = 0;
        if (is_defined(tagMap)) {
            if (is_defined(tagMap[eachResult["id"]]))
                eachResult["taggedUserCountInPost"] = tagMap[eachResult["id"]].length;
        }
        commentsArray.push(eachResult);
    }

    var stringBuilder = [];

    if (isShowTopInfo)
        stringBuilder.push(String.format('<caption style="text-align:left">Result : <a href="{0}">{0}</a><br/></caption>', g_appContext.postLoader.permalink_url));

    stringBuilder.push("<tr>");
    if (isShowReactions)
        stringBuilder.push("<td>Post Reaction</td>");
    stringBuilder.push("<td>ID</td>");
    if (isShowCommentLink)
        stringBuilder.push("<td>Comment Link</td>");
    stringBuilder.push("<td>Name</td><td>Date</td><td>Text</td>");
    stringBuilder.push("<td>Likes Count</td>");
    stringBuilder.push("<td>Tagged User Count on This Comment</td>");
    stringBuilder.push("<td>Tagged User Count in Entire Post</td>");
    if (isShowAttachment)
        stringBuilder.push("<td>Images</td>");
    stringBuilder.push("</tr>");

    for (var i = 0; i < commentsArray.length; i++) {
        var attachmentTd = "";
        if (isShowAttachment) {
            attachmentTd = "<td>&nbsp;</td>";
            if (commentsArray[i]["attachmentUrl"] != "") {
                attachmentTd = String.format("<td height='150' sorttable_customkey='1'><img src='{1}' height='150'><br/><a href='{0}' target='_blank'>(Link)</a></td>",
                    commentsArray[i]["attachmentUrl"], commentsArray[i]["attachmentImage"]);
            }
        }

        var tdReactions = "";
        if (isShowReactions) {
            tdReactions = "<td>&nbsp;</td>";
            if (reactionsMap[commentsArray[i]["id"]] !== undefined)
                tdReactions = "<td>" + reactionsMap[commentsArray[i]["id"]]['reaction_type'] + "</td>";
        }

        var tdCommentLink = "";
        if (isShowCommentLink) {
            tdCommentLink = '<td><a href="' + commentsArray[i]["link"] + '" target="_blank">Link</a></td>';
        }
        stringBuilder.push("<tr>");
        stringBuilder.push(tdReactions);
        stringBuilder.push(String.format("<td style='mso-number-format:\"\\@\"'>{0}</td>", commentsArray[i]["id"]));
        stringBuilder.push(tdCommentLink);
        stringBuilder.push(String.format("<td><a href='http://facebook.com/{0}' target='_blank'>{1}</a></td>"
            , commentsArray[i]["id"], commentsArray[i]["name"]));
        stringBuilder.push(String.format("<td>{0}</td>", commentsArray[i]["time"]));
        stringBuilder.push(String.format("<td>{0}</td>", commentsArray[i]["htmlMessage"]));
        stringBuilder.push(String.format("<td>{0}</td>", commentsArray[i]["commentLikes"]));
        stringBuilder.push(String.format("<td>{0}</td>", commentsArray[i]["taggedUserCountInComment"]));
        stringBuilder.push(String.format("<td>{0}</td>", commentsArray[i]["taggedUserCountInPost"]));
        stringBuilder.push(attachmentTd);
        stringBuilder.push("</tr>");
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