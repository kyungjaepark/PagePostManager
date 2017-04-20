var g_appConfig =
    {
        basicPermissions: ['public_profile'],
        appId: '624861190962222'
    }

var g_appContext =
    {
        initialized: false,
        searchType: 'page',
        boardInfo:
        {
            id: 0,
            type: 'page',
            name: '',
        },
        postLoader: null,
        postDownloaderModal: null,
        currentFragment: undefined, // aka 'hash'
        tableGenerationOption: {},
    }

function switchPage(pageName) {
    $('.app-pages').addClass('hidden');
    $('#page-' + pageName).removeClass('hidden');
    $('html,body').scrollTop(0);
}
$().ready(function () { main(); });

function main() {
	ga_event_page_only_once('PageLoadComplete');
    $('body').css('display', '');
    wireEvents();
    wireEvents_post();
    wireEvents_gpe();
    switchPage('loading');
    SimpleTranslator.init(getParamMap()['lang'])
    SimpleTranslator.translate();
    initGraphApiLocale();
    fbmanager.jQueryInit(g_appConfig.appId, onFbInitialized);
}

function wireEvents() {
    $('#btn-basic-login').click(onBtnBasicLoginClick);
    $('#btn-search-my-pages').click(onBtnSearchMyPagesClick);
    $('#btn-search-my-groups').click(onBtnSearchMyGroupsClick);
    $('#btn-search-page').click(onBtnSearchPageClick);
    $('#btn-search-group').click(onBtnSearchGroupClick);
    $('#btn-search-result-more').click(onBtnPageSearchResultMoreClick);
    $('#btn-board-search-again').click(onBtnBoardSearchAgainClick);
    $('#btn-goto-search').click(onBtnGotoSearchClick);
    $('#btn-goto-post-list').click(onBtnGotoPostListClick);
    $('#btn-board-post-list-more').click(onBtnBoardPostListMoreClick);
    $('#btn-parse-comment-plugin').click(onBtnParseCommentPluginClick);
    $(window).bind('hashchange', applyFragmentValue);
}

function initGraphApiLocale() {
    $('#graph-api-locale').html('');
    var locale_array = [['en_US', 'English(US)'], ['ko_KR', '한국어']];
    $.each(locale_array, function () {
        $('<option>')
            .attr('value', this[0])
            .text(this[1])
            .appendTo($('#graph-api-locale'));
    });
}
function applyFragmentValue() {
    if (g_appContext.initialized == false)
        return;
    var hashValue = location.hash || '';
    if (hashValue.substr(0, 1) == '#')
        hashValue = hashValue.substr(1);
    if (g_appContext.currentFragment === hashValue)
        return;
    g_appContext.currentFragment = hashValue;

    if (hashValue.indexOf("board:") == 0) {
        trySetupBoard(
            hashValue.substr(6),
            board_loadSuccess,
            function () {
                alert(SimpleTranslator.getKey('fatal_error')); // TODO
            });
        return;
    }
    if (hashValue.indexOf("post:") == 0) {
        trySetupPost(
            hashValue.substr(5),
            post_loadSuccess,
            function () {
                alert(SimpleTranslator.getKey('fatal_error')); // TODO
            });
        return;
    }

    searchPage_start();
    return;
}

function setCommandFragment(fragment) {
    location.hash = fragment;
}

function onFbInitialized() {

    $('#shareBox').html('<div class="fb-like" data-href="http://kyungjaepark.com/pagepostmanager" data-layout="standard" data-action="like" data-show-faces="true" data-share="true"></div>');
    $('#commentBox').html('<div class="fb-comments" data-href="http://kyungjaepark.com/pagepostmanager" data-width="470" data-num_posts="3" data-order_by="reverse_time"></div>');
    FB.XFBML.parse(document.getElementById('shareBox'));
    FB.XFBML.parse(document.getElementById('fb-comments'));

    switchPage('welcome');
    processBasicLogin();
}

function processBasicLogin() {
    var lackingPermission = fbmanager.checkForLackingPermission(g_appConfig.basicPermissions);
    if (lackingPermission.length == 0) {
        $('#basic-login-box').addClass('hidden');
        onBasicLoginComplete();
    }
    else {
        $('#basic-login-box').removeClass('hidden');
        $('#btn-basic-login').prop('disabled', false);
    }
}

function onBtnBasicLoginClick() {
    $('#btn-basic-login').prop('disabled', true);
    FB.login(function (response) {
        fbmanager.refreshPermission(processBasicLogin);
    }, { scope: g_appConfig.basicPermissions, return_scopes: true });
}

function onBasicLoginComplete() {
	ga_event_page_only_once('FacebookLoginSuccess');
    g_appContext.initialized = true;
    applyFragmentValue();
}

// search ----------------------------------------------------------------------

function searchPage_start() {
    switchPage('search');
    searchPage_clear();
}

function searchPage_clear() {
    $('#txt-search').val('');
    $('#page-search-result').addClass('hidden');
    $('#page-search-result-empty').addClass('hidden');
}

function onBtnSearchMyPagesClick() {
    function onSuccess() {
        searchPage_startRequest('/me/accounts', {}, 'page');
    }
    var extraPermissions = ['pages_show_list'];
    var lackingPermission = fbmanager.checkForLackingPermission(extraPermissions);
    if (lackingPermission.length == 0) {
        onSuccess();
    }
    else {
        FB.login(function (response) {
            fbmanager.refreshPermission(function () {
                if (fbmanager.checkForLackingPermission(lackingPermission).length == 0)
                    onSuccess();
                else {
                    // TODO: 실패 안내 메시지
                }
            });
        }, { scope: lackingPermission, return_scopes: true });
    }
}

function onBtnSearchMyGroupsClick() {
    function onSuccess() {
        searchPage_startRequest('/me/groups', {}, 'group');
    }
    var extraPermissions = ['user_managed_groups'];
    var lackingPermission = fbmanager.checkForLackingPermission(extraPermissions);
    if (lackingPermission.length == 0) {
        onSuccess();
    }
    else {
        FB.login(function (response) {
            fbmanager.refreshPermission(function () {
                if (fbmanager.checkForLackingPermission(lackingPermission).length == 0)
                    onSuccess();
                else {
                    // TODO: 실패 안내 메시지
                }
            });
        }, { scope: lackingPermission, return_scopes: true });
    }
}

function onBtnSearchPageClick() {
    searchPage_startRequest('/search', { q: $('#txt-search').val(), type: 'page' }, 'page');
}
function onBtnSearchGroupClick() {
    searchPage_startRequest('/search', { q: $('#txt-search').val(), type: 'group' }, 'group');
}

function searchPage_startRequest(apiPrefix, param, searchType) {
    g_appContext.searchType = searchType;
    param["fields"] = "id,name,picture,fan_count,category,about,description,general_info,is_verified,username,members.summary(true)";
    param["locale"] = $('#graph-api-locale').val();
    $('#tbl-page-search-result tr:gt(0)').remove();
    $('#page-search-result').addClass('hidden');
    $('#page-search-result-empty').addClass('hidden');
    FB.api(apiPrefix, param, function (response) { searchPage_processResult(response); });
}

function searchPage_processResult(response) {
    var verified_img = $('<img>')
        .attr('src', 'res/fb-verified.png')
        .attr('width', '14')
        .css('margin-left', '3px');

    $.each(response.data, function () {
        var curRow = $('<tr>')
            .addClass("ex-hand-cursor")
            .click(searchPage_onPageSelection)
            .attr('id', this.id)
            .appendTo($('#tbl-page-search-result'));

        // image
        $('<td>')
            .append($('<img>').attr('src', this.picture.data.url))
            .appendTo(curRow);

        // text
        var textTd = $('<td>');
        textTd.addClass('text-left');
        textTd.append($('<strong>').text(this.name));

        if (g_appContext.searchType == 'group') {
            textTd.append($('<br/>'));
            textTd.append($('<strong>').addClass('small').text(numberWithCommas(this.members.summary.total_count) + ' Reactions'));
            textTd.append($('<pre>').css('background-color', 'lightyellow').css('white-space', 'pre-line').text(this.description));
        }
        else {
            if (this.is_verified)
                textTd.append(verified_img.clone());
            textTd.append($('<br/>'));
            textTd.append($('<strong>').addClass('small').text(numberWithCommas(this.fan_count) + ' Fans'));
            textTd.append($('<br/>'));
            textTd.append($('<small>').text(this.category));
            textTd.append($('<br/>'));
            textTd.append($('<pre>').css('background-color', 'lightyellow').css('white-space', 'pre-line').text(this.about));
        }

        textTd.appendTo(curRow);
    });

    if ($('#tbl-page-search-result tr:gt(0)').length > 0)
        $('#page-search-result').removeClass('hidden');
    else
        $('#page-search-result-empty').removeClass('hidden');

    $('#btn-search-result-more').addClass('hidden');
    $('#btn-search-result-more').prop('disabled', true);
    if (is_defined(response.paging)) {
        if (is_defined(response.paging.next)) {
            $('#btn-search-result-more').attr('api', response.paging.next);
            $('#btn-search-result-more').removeClass('hidden');
            $('#btn-search-result-more').prop('disabled', false);
        }
    }
}
function onBtnPageSearchResultMoreClick() {
    $(this).prop('disabled', true);
    FB.api($(this).attr('api'), function (response) { searchPage_processResult(response); });
}

function searchPage_onPageSelection() {
    setCommandFragment("board:" + $(this).attr('id'));
}

// facebook comment plugin -----------------------------------------------------

function onBtnParseCommentPluginClick() {
    FB.api('/?id=' + $('#txt-comment-plugin-data').val(), function (response) {
        setCommandFragment("post:" + response["og_object"].id);
    });
}

// board -----------------------------------------------------------------------

function trySetupBoard(boardId, successCallback, failCallback) {
    FB.api('/' + boardId,
        {
            metadata: 1,
            fields: "id,metadata{type},name",
            locale: $('#graph-api-locale').val(),
        },
        function (response) {
            if (is_defined(response.error) && is_defined(failCallback)) {
                failCallback(response);
                return;
            }
            g_appContext.boardInfo.id = response.id;
            g_appContext.boardInfo.type = response.metadata.type;
            g_appContext.boardInfo.name = response.name;
            ga('send', 'event', g_appContext.boardInfo.type, 'list', g_appContext.boardInfo.name);
            successCallback(response);
        }
    );
}

function board_loadSuccess() {
	ga_event_page_only_once('BoardSelected');
    switchPage('board');
    $('#board-name').text(String.format(SimpleTranslator.getKey('post_list_title_format'),
        g_appContext.boardInfo.name,
        SimpleTranslator.getKey(g_appContext.boardInfo.type == 'group' ? 'group' : 'page')));

    $("#group-post-extract-div").addClass('hidden');
    //if (g_appContext.boardInfo.type == 'group')
    $("#group-post-extract-div").removeClass('hidden');

    $('#tbl-board-post-list tr:gt(0)').remove();
    var edgeName = (g_appContext.boardInfo.type === 'group' ? 'feed' : 'posts');
    FB.api(String.format('/{0}/{1}', g_appContext.boardInfo.id, edgeName),
        {
            'fields': 'id,permalink_url,from,admin_creator,icon,message,updated_time,story,picture,reactions.summary(1).limit(1),comments.filter(stream).summary(1).limit(1),status_type',
            locale: $('#graph-api-locale').val()
        },
        function (response) {
            board_processResult(response);
        });
}

function onBtnBoardSearchAgainClick() {
    setCommandFragment('');
}

function onBtnGotoSearchClick() {
    setCommandFragment('');
}

function onBtnGotoPostListClick() {
    setCommandFragment('board:' + g_appContext.boardInfo.id);
}

function generatePostInfoTr(responseData, isWebsite) {
    var curRow = $('<tr>');

    // image
    var newTd = $('<td>').appendTo(curRow);
    if (isWebsite == false)
        newTd.append($('<img>').attr('src', responseData.picture).css('max-width', '150px').addClass("img-responsive"));


    // text
    var textTd = $('<td>');
    textTd.addClass('text-left');

    var header = "[?]";
    if (is_defined(responseData.from))
        header = responseData.from.name;
    if (isWebsite)
        header = "(Website)";
    textTd.append($('<strong>').text(header));
    textTd.append($('<br/>'));
    var url = responseData.permalink_url || responseData.url || "#";
    textTd.append($('<a>').text(url).attr('href', url));
    textTd.append($('<br/>'));

    $('<strong>')
        .addClass('small')
        .text(numberWithCommas(responseData.reactions.summary.total_count) + ' Reactions')
        .appendTo(textTd);
    $('<br/>').appendTo(textTd);
    $('<strong>')
        .addClass('small')
        .text(numberWithCommas(responseData.comments.summary.total_count) + ' Comments')
        .appendTo(textTd);
    $('<br/>').appendTo(textTd);

    var bodytext = stringify(responseData.message);
    if (bodytext == "" && is_defined(responseData.story))
        bodytext = responseData.story;
    $('<pre>')
        .css('background-color', 'lightyellow')
        .css('white-space', 'pre-line')
        .text(bodytext)
        .appendTo(textTd);
    $('<br/>').appendTo(textTd);

    textTd.appendTo(curRow);

    return curRow;
}

function board_processResult(response) {
    $.each(response.data, function () {
        generatePostInfoTr(this, false)
            .addClass("ex-hand-cursor")
            .click(board_onPostSelection)
            .attr('id', this.id)
            .appendTo($('#tbl-board-post-list'));
    });

    if ($('#tbl-board-post-list tr:gt(0)').length > 0)
        $('#board-post-list').removeClass('hidden');

    var moreButton = $('#btn-board-post-list-more');
    moreButton.addClass('hidden');
    moreButton.prop('disabled', true);
    if (is_defined(response.paging)) {
        if (is_defined(response.paging.next)) {
            moreButton.attr('api', response.paging.next);
            moreButton.removeClass('hidden');
            moreButton.prop('disabled', false);
        }
    }
}
function onBtnBoardPostListMoreClick() {
    $(this).prop('disabled', true);
    FB.api($(this).attr('api'), function (response) { board_processResult(response); });
}
function board_onPostSelection() {
    setCommandFragment("post:" + $(this).attr('id'));
}

// post (todo) -----------------------------------------------------------------

jQuery.fn.extend({
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
});

function recalcProgressBar(progressBar) {
    var result = 0;
    if (progressBar.attr('aria-valuemax') > 0)
        result = Math.floor(progressBar.attr('aria-valuenow') / progressBar.attr('aria-valuemax') * 100);
    progressBar.css('width', result + '%')
    progressBar.text(result + "% (" + progressBar.attr('aria-valuenow') + " / " + progressBar.attr('aria-valuemax') + ")");
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

    $('#reportOption').removeClass('hidden');
    $('#reportResult').addClass('hidden');

    g_appContext.postLoader.init(postId, $('#graph-api-locale').val(), function (response) {
        $('#tblShortSummary').find('tr').remove();
        $('#tblResultTable').find('tr').remove();

        var _tr = $('<tr>').appendTo($('#tblShortSummary'));
        $('<td>').appendTo(_tr).text('Image');
        $('<td>').appendTo(_tr).text('Text');
        $('#tblShortSummary').append(generatePostInfoTr(response, g_appContext.postLoader.isWebsite));
        ga('send', 'event', g_appContext.boardInfo.type, 'post', postId);
        successCallback(response);
    }, failCallback);
}

function post_loadSuccess() {
	ga_event_page_only_once('PostSelected');
    switchPage('post');
    $('#btn-goto-post-list').addClass('hidden');
    if (g_appContext.boardInfo.id != 0)
        $('#btn-goto-post-list').removeClass('hidden');
    $('#divResultButtons').hide();
    $('#alertResultsPlaceholder').show();
}

function getReactions() {
    $('#tblResultTable').find('tr').remove();
    g_appContext.postLoader.launchLoaderModal(g_appContext.postDownloaderModal, true, false, function () {
        g_appContext.tableGenerationOption = {
            tableType: 'reactions',
            reactionsMap: g_appContext.postLoader.getReactionsMap(),
        };

        $('#reportOption').addClass('hidden');
        $('#reportResult').removeClass('hidden');
        $('#tblResultTable').addClass('hidden');
        $('#divResultButtons').show();
        $('#alertResultsPlaceholder').hide();
        ga('send', 'event', g_appContext.boardInfo.type, 'reactions', g_appContext.postLoader.postId, g_appContext.postLoader.reactionsLoader.resultArray.length);
		ga_event_page_only_once('ExtractComplete');		
    });
}

function getComments() {
    $('#tblResultTable').find('tr').remove();
    g_appContext.postLoader.launchLoaderModal(g_appContext.postDownloaderModal, chkReactions.checked, true, function () {

        g_appContext.tableGenerationOption = {
            tableType: 'comments',
            reactionsMap: chkReactions.checked ? g_appContext.postLoader.getReactionsMap() : {},
            commentsArray: g_appContext.postLoader.getCommentsArray($('#chkSkipUnknownUser').prop('checked')),
        };
        if (getCommentsArray_errorCount > 0)
            alert(String.format(SimpleTranslator.getKey('from_not_found'), getCommentsArray_errorCount));

        $('#reportOption').addClass('hidden');
        $('#reportResult').removeClass('hidden');
        $('#tblResultTable').addClass('hidden');
        $('#divResultButtons').show();
        $('#alertResultsPlaceholder').hide();
        ga('send', 'event', g_appContext.boardInfo.type, 'comments', g_appContext.postLoader.postId, g_appContext.tableGenerationOption["commentsArray"].length);
		ga_event_page_only_once('ExtractComplete');
    });
}

function buildResultTable()
{
    $('#tblResultTable').find('tr').remove();
    tblResultTable.innerHTML = getResultTableHtml(g_appContext.tableGenerationOption);
    sorttable.makeSortable(tblResultTable);
}

function wireEvents_post() {
    $("#prgLoadReactionsInfo")._k_progressBarValue(0);
    $("#prgLoadCommentsInfo")._k_progressBarValue(0);
    $('#btnLoadSummary').click(function () { getReactions(); });
    $('#btnLoadReactions').click(function () { getReactions(); });
    $('#btnLoadComments').click(function () { getComments(); });
    $('#btnExportResultTable').click(function () { buildResultTable(); tableToExcel(tblResultTable.outerHTML, 'Results', 'results_pagepostmanager.xls'); });
    $('#btnExportResultTableXlsx').click(function () { generateXlsx('results_pagepostmanager.xls'); });
    $('#btnExportResultAttachmentsZip').click(function () { startDownloadAttachments(); });
    $('#btnShowResultTable').click(function () { buildResultTable(); $('#tblResultTable').removeClass('hidden'); });
    $('#btnShowResultTableNewWindow').click(function () { buildResultTable(); writeToNewTable($('#tblResultTable')); });
    $('#btnChangeOption').click(function () {
        $('#reportOption').removeClass('hidden'); $('#reportResult').addClass('hidden');
        ;
    });
}

function generateXlsx(xlsxFilename)
{
    var xlsxObject = getResultTableXlsx(g_appContext.tableGenerationOption);
    alert('todo:xlsxObject->xlsxFilename');
}

function startDownloadAttachments() {
    var attachmentsMap = {};
    $.each(g_appContext.postLoader.commentsLoader.resultArray, function () {
        if (isPropertyExists(this, ["attachment", "media", "image", "src"]) == false)
            return true;

        var ext = '.jpg';
        if (this.attachment.media.image.src.indexOf('.gif') >= 0)
            ext = '.gif';
        if (this.attachment.media.image.src.indexOf('.png') >= 0)
            ext = '.png';

        attachmentsMap[this.id] = {
            localName: this.id + ext,
            url: this.attachment.media.image.src,
            blob: null
        };
    })

    startDownloadAttachments_fetch(attachmentsMap);
};

function startDownloadAttachments_fetch(attachmentsMap) {
    for (var t in attachmentsMap) {
        if (attachmentsMap[t].blob === null) {
            // http://www.henryalgus.com/reading-binary-files-using-jquery-ajax/
            var xhr = new XMLHttpRequest();
            xhr.open('GET', attachmentsMap[t].url, true);
            xhr.responseType = 'arraybuffer'; //'blob';
            xhr.onload = function (e) {
                if (this.status == 200) {
                    // get binary data as a response
                    attachmentsMap[t].blob = this.response;
                    startDownloadAttachments_fetch(attachmentsMap);
                }
            };

            xhr.send();
            return;
        }
    }

    var zip = new JSZip();
    // zip.file("Hello.txt", "Hello World\n");
    var img = zip.folder("images");
    for (var t in attachmentsMap) {
        img.file(attachmentsMap[t].localName, attachmentsMap[t].blob, { base64: true });
    }

    var html = '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>';
    {
        var new_body = $('<body>');
        $('#tblResultTable')
            .clone()
            .attr('border', '1')
            .appendTo(new_body);

        html += new_body[0].outerHTML;
        for (var t in attachmentsMap) {
            var org = $('<div>').text(attachmentsMap[t].url).html();
            var rep = './images/' + attachmentsMap[t].localName;
            while (org != '') {
                var idx = html.indexOf(org);
                if (idx < 0)
                    break;
                html = html.substr(0, idx) + rep + html.substr(idx + org.length);
            }
        }
        zip.file('index.html', html);
    }

    var content = zip.generate({ type: "blob" });
    saveAs(content, "pagepostmanager_attachments.zip");
}


function writeToNewTable(tblEntity) {
    var w = window.open();
    var new_body = $('<body>');
    tblEntity
        .clone()
        .attr('border', '1')
        .appendTo(new_body);
    $(w.document.head).html('<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>');
    $(w.document.body).html(new_body.html());
}


var ga_event_page_only_once_sentEvents = [];
function ga_event_page_only_once(eventName)
{
	if (ga_event_page_only_once_sentEvents.indexOf(eventName) >= 0)
		return;
	ga_event_page_only_once_sentEvents.push(eventName);
	ga('send', { hitType: 'pageview', page: '/pagepostmanager/~virtual/' + eventName });
}