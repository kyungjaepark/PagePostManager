var gpe_status = {
    postData: [],
    stopRequested: false
};
function wireEvents_gpe() {
    $('#btn-group-post-extract-show').click(function() { showGpe(); });
    $('#gpe-stop').click(function() { gpeStop(); });
    $('#gpe-excel').click(function() { gpeExcel(); });
    $('#gpe-new').click(function() { gpeNew(); });
    $('#gpe-close').click(function() { gpeClose(); });
}

function showGpe() {
    $("#group-post-extractor").removeClass('hidden');
    $("#group-post-start").removeClass('hidden');
    $("#gpe-progress").text('추출을 시작합니다.');
    $("#group-post-extract").addClass('hidden');
    gpe_status.postData = [];
    gpe_status.stopRequested = false;
    $('#gpe-extracted-table').html('');

    FB.api(String.format('/{0}/feed', g_appContext.boardInfo.id),
        { 'fields': 'id,from,admin_creator,icon,message,updated_time,story,picture,attachments,likes.summary(1).limit(1),comments.filter(stream).summary(1).limit(1),status_type' 
    , 'date_format': 'c', 'limit':50},
        function(response) {
            gpe_processResult(response);
        });
}

function gpe_processResult(response) {
    var update_time = '';
    $.each(response.data, function() {
        gpe_status.postData.push(this);
        update_time = this.updated_time;
    });
    $('#gpe-progress').text(String.format('{0}까지의 게시물 {1}개가 추출되었습니다.',
    update_time, gpe_status.postData.length));

    if (is_defined(response.paging) == false || is_defined(response.paging.next) == false)
        gpe_status.stopRequested = true;

    if (gpe_status.stopRequested) {
        gpe_startParse();
        return;
    }
    
    FB.api(response.paging.next, gpe_processResult);
}

function gpeStop() {
    gpe_status.stopRequested = true;
}

function gpe_startParse() {
    $('#gpe-start').addClass('hidden');
    $('#gpe-extract').removeClass('hidden');
    
    var tbl = $('#gpe-extracted-table');
    tbl.html('');
    $('<tr>')
    .appendTo(tbl)
    .append($('<td>').text('수정일'))
    .append($('<td>').text('올린이ID'))
    .append($('<td>').text('올린이이름'))
    .append($('<td>').text('내용'))
    .append($('<td>').text('첨부'));
    
    $.each (gpe_status.postData, function() {
        
        
        var attachmentUrl = parseAttachmentUrl(this.attachment).url;
        var attachmentImage = parseAttachmentUrl(this.attachment).image;
        
        attHtml = '';
        $.each(this.attachments, function() {
            $.each(this, function() {
                if (is_defined(this.media) && is_defined(this.media.image))
                    attHtml += String.format("<a href='{0}' target='_blank'><img src='{1}' height='150'></a><br/>",
                        this.url, this.media.image.src);
                    })
        });

        
        var _tr = $('<tr>');
        $('<td>')
            .text(this.updated_time)
            .appendTo(_tr);
        $('<td>')
            .css('mso-number-format', '"\\@"')
            .text(this.from.id)
            .appendTo(_tr);
        $('<td>')
            .text(this.from.name)
            .appendTo(_tr);
        $('<td>')
            .html(decorateMessageWithTags(this.message, this.message_tags))
            .appendTo(_tr);
        $('<td>')
            .html(attHtml)
            .appendTo(_tr);
        _tr.appendTo(tbl);
    });
}
function gpeExcel() {
    tableToExcel($('#gpe-extracted-table')[0].outerHTML, 'Results', 'results_grouppostlist.xls');
}

function gpeNew() {
    writeToNewTable($('#gpe-extracted-table'));
}

function gpeClose() {
    $('#group-post-extractor').addClass('hidden');
}
