var gpe_status = {
    postData: [],
    stopRequested: false
};
function wireEvents_gpe() {
    $('#btn-group-post-extract-show').click(function() { showGpe(); });
    $('#gpe-start').click(function() { gpeStart(); });
    $('#gpe-stop').click(function() { gpeStop(); });
    $('#gpe-excel').click(function() { gpeExcel(); });
    $('#gpe-new').click(function() { gpeNew(); });
    $('#gpe-close').click(function() { gpeClose(); });
//  <div id="gpe-datetimepicker-from"></div>
//   <div id="gpe-datetimepicker-to"></div>
    $('#gpe-datetimepicker-from').datetimepicker({
        sideBySide: true,
        format:'YYYY-MM-DD HH:mm:ss',
    });
    $('#gpe-datetimepicker-to').datetimepicker({
        sideBySide: true,
        format:'YYYY-MM-DD HH:mm:ss',
    });
}

function showGpe() {
    $("#group-post-extractor").removeClass('hidden');
    $('#gpe-welcome').removeClass('hidden');
    $('#gpe-retrieve').addClass('hidden');
    $('#gpe-extract').addClass('hidden');
}

function gpeStart() {
    $('#gpe-welcome').addClass('hidden');
    $('#gpe-retrieve').removeClass('hidden');
    $('#gpe-extract').addClass('hidden');
    $("#gpe-progress").text('추출을 시작합니다.');
    $("#group-post-extract").addClass('hidden');
    gpe_status.postData = [];
    gpe_status.stopRequested = false;
    $('#gpe-extracted-table').html('');

    var edgeName = (g_appContext.boardInfo.type === 'group' ? 'feed' : 'posts');

    var param = { 'fields': 'id,from,admin_creator,icon,message,created_time,story,picture,attachments,likes.summary(1).limit(1),comments.filter(stream).summary(1).limit(1),status_type' 
    , 'date_format': 'c', 'limit':50, locale:$('#graph-api-locale').val()};
    if ($('#gep-check-range').prop('checked'))
    {
        param["since"] = moment($('#gpe-datetimepicker-from').val()).unix();
        param["until"] = moment($('#gpe-datetimepicker-to').val()).unix();
        console.log(param);
    }
    
    FB.api(String.format('/{0}/{1}', g_appContext.boardInfo.id, edgeName),
        param,
        function(response) {
            gpe_processResult(response);
        });
}

function gpe_processResult(response) {
    var update_time = '';
    $.each(response.data, function() {
        gpe_status.postData.push(this);
        update_time = this.created_time;
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
    $('#gpe-welcome').addClass('hidden');
    $('#gpe-retrieve').addClass('hidden');
    $('#gpe-extract').removeClass('hidden');
    
    var tbl = $('#gpe-extracted-table');
    tbl.html('');
    $('<tr>')
    .appendTo(tbl)
    .append($('<td>').text('날짜/시간'))
    .append($('<td>').text('게시자'))
    .append($('<td>').text('게시글내용'))
    .append($('<td>').text('게시글주소'))
    .append($('<td>').text('게시자페북주소'))
    .append($('<td>').text('첨부이미지'));
    
    $.each (gpe_status.postData, function() {
        
        
        var attachmentUrl = parseAttachmentUrl(this.attachment).url;
        var attachmentImage = parseAttachmentUrl(this.attachment).image;
        
        attHtml = '';
        $.each(this.attachments, function() {
            $.each(this, function() {
                if (is_defined(this.media) && is_defined(this.media.image))
                    attHtml += String.format("<img src='{1}' height='150'><br/><a href='{0}' target='_blank'>(Link)</a><br/><br/>",
                        this.url, this.media.image.src);
                    })
        });

        
        var _tr = $('<tr>');
        $('<td>')
            .text(moment(this.created_time).format('YYYY-MM-DD HH:mm:ss'))
            .appendTo(_tr);
        $('<td>')
            .text(this.from.name)
            .appendTo(_tr);
        $('<td>')
            .html(decorateMessageWithTags(this.message, this.message_tags)
                .replaceAll('\r','')
                .replaceAll('\n','<br style="mso-data-placement:same-cell;" />'))
            .appendTo(_tr);
            
        var lnk_post = 'https://www.facebook.com/' + this.id;
        var lnk_author = 'https://www.facebook.com/' + this.from.id;
        $('<td>')
            .append($('<a>').attr('href', lnk_post).text(lnk_post))
            .appendTo(_tr);
        $('<td>')
//            .attr('style', 'mso-number-format:"\\@"')
            .append($('<a>').attr('href', lnk_author).text(lnk_author))
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
    gpe_status.stopRequested = false;
    $('#group-post-extractor').addClass('hidden');
}
