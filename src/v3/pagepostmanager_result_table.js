
function getResultTableHtml(tableGenerationOption)
{
    if (tableGenerationOption["tableType"] == 'comments')
    {
        return getCommentsHtml(
            tableGenerationOption["commentsArray"],
            tableGenerationOption["reactionsMap"]
            , chkShowAttachment.checked, chkReactions.checked, chkCommentLink.checked,
            $('#chkShowTopInfo').prop('checked'));
    }
    if (tableGenerationOption["tableType"] == 'reactions')
    {
        return generateReactionsHtml(g_appContext.tableGenerationOption["reactionsMap"]);
    }
    return '';
}
function generateReactionsHtml(reactionsMap) {
    var stringBuilder = [];
    stringBuilder.push("<tr><th>ID</th><th>이름</th><th>반응</th></tr>");
    for (var x in reactionsMap)
        stringBuilder.push(String.format("<tr><td style='mso-number-format:\"\\@\"'>{0}</td><td><a href='http://facebook.com/{0}' target='_blank'>{1}</a></td><td>{2}</td></tr>", x, reactionsMap[x]['name'], reactionsMap[x]['reaction_type']));
    return stringBuilder.join("");
}

function getCommentsHtml(commentsArray, reactionsMap, isShowAttachment, isShowReactions, isShowCommentLink, isShowTopInfo) {

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
