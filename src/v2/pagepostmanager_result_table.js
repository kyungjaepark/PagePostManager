function decorateMessageWithTags(message, message_tags) {
    var finalMessage = message + "";
    if (message_tags !== undefined) {
        var sortedMessageTags = message_tags.concat();
        sortedMessageTags.sort(function(a, b) { return b["offset"] - a["offset"] });

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

function generateLikesHtml(likesMap) {
    var stringBuilder = [];
    stringBuilder.push("<tr><th>ID</th><th>이름</th></tr>");
    for (var x in likesMap)
        stringBuilder.push(String.format("<tr><td style='mso-number-format:\"\\@\"'>{0}</td><td><a href='http://facebook.com/{0}' target='_blank'>{1}</a></td></tr>", x, likesMap[x]));
    return stringBuilder.join("");
}

function getCommentsHtml(results, likesMap, isShowAttachment, isShowLikes, isShowCommentLink) {

    var commentsArray = [];
    for (var i = 0; i < results.length; i++) {
        var curResult = results[i];
        var eachResult = {};
        if (is_defined(curResult["from"]) == false)
            continue;
        eachResult["id"] = curResult["from"]["id"];
        eachResult["name"] = curResult["from"]["name"];
        eachResult["time"] =  moment(curResult["created_time"]).format('YYYY-MM-DD HH:mm:ss');
        eachResult["timeRaw"] = curResult["created_time"];
        eachResult["htmlMessage"] = decorateMessageWithTags(curResult["message"], curResult["message_tags"]);
        eachResult["link"] = String.format("https://www.facebook.com/{0}", curResult["id"]);
        eachResult["commentLikes"] = curResult["like_count"];
        eachResult["attachmentUrl"] = parseAttachmentUrl(curResult["attachment"])["url"];
        eachResult["attachmentImage"] = parseAttachmentUrl(curResult["attachment"])["image"];
        eachResult["json"] = JSON.stringify(curResult);
        commentsArray.push(eachResult);
    }

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
                attachmentTd = String.format("<td height='150' sorttable_customkey='1'><img src='{1}' height='150'><br/><a href='{0}' target='_blank'>(Link)</a></td>",
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