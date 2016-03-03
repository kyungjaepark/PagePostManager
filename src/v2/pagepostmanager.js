
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
    }

function switchPage(pageName) {
    $('.app-pages').addClass('hidden');
    $('#page-' + pageName).removeClass('hidden');
}
$().ready(function () { main(); });

function main() {
    wireEvents();
    switchPage('loading');
    new SimpleTranslator().translate(getParamMap()['lang']);
    fbmanager.jQueryInit(g_appConfig.appId, onFbInitialized);
}

function wireEvents() {
    $('#btn-basic-login').click(onBtnBasicLoginClick);
    $('#btn-search-my-pages').click(onBtnSearchMyPagesClick);
    $('#btn-search-page').click(onBtnSearchPageClick);
    $('#btn-search-group').click(onBtnSearchGroupClick);
    $('#btn-search-result-more').click(onBtnPageSearchResultMoreClick);
    $('#btn-board-search-again').click(onBtnBoardSearchAgainClick);
}

function onFbInitialized() {
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
    g_appContext.initialized = true;
    searchPage_start();
}

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

function onBtnSearchPageClick() {
    searchPage_startRequest('/search', { q: $('#txt-search').val(), type: 'page' }, 'page');
}
function onBtnSearchGroupClick() {
    searchPage_startRequest('/search', { q: $('#txt-search').val(), type: 'group' }, 'group');
}

function searchPage_startRequest(apiPrefix, param, searchType) {
    g_appContext.searchType = searchType;
    param["fields"] = "id,name,picture,likes,category,about,description,general_info,is_verified,username,members.summary(true)";

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
        var nameTd = $('<td>');
        nameTd.addClass('text-left');
        nameTd.append($('<strong>').text(this.name));

        if (g_appContext.searchType == 'group') {
            nameTd.append($('<br/>'));
            nameTd.append($('<strong>').addClass('small').text(numberWithCommas(this.members.summary.total_count) + ' Likes'));
            nameTd.append($('<pre>').css('background-color', 'lightyellow').css('white-space', 'pre-line').text(this.description));
        }
        else {
            if (this.is_verified)
                nameTd.append(verified_img.clone());
            nameTd.append($('<br/>'));
            nameTd.append($('<strong>').addClass('small').text(numberWithCommas(this.likes) + ' Likes'));
            nameTd.append($('<br/>'));
            nameTd.append($('<small>').text(this.category));
            nameTd.append($('<br/>'));
            nameTd.append($('<pre>').css('background-color', 'lightyellow').css('white-space', 'pre-line').text(this.about));
        }

        nameTd.appendTo(curRow);
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
    trySetupBoard($(this).attr('id'), board_loadSuccess, function () {
        // TODO
        alert('정보를 읽어오는 데 실패했습니다. 새로고침 후 다시 시도해 주세요.');
    });
}

function trySetupBoard(boardId, successCallback, failCallback) {
    FB.api('/' + boardId,
        {
            metadata: 1,
            fields: "id,metadata{type},name",
        },
        function (response) {
            if (is_defined(response.error)) {
                if (is_defined(failCallback))
                    failCallback();
            }
            else {
                g_appContext.boardInfo.id = response.id;
                g_appContext.boardInfo.type = response.metadata.type;
                g_appContext.boardInfo.name = response.name;
                successCallback();
            }
        }
        );
}

function board_loadSuccess() {
    switchPage('board');
    $('#board-name').text(String.format('[{0}] {1}의 게시물:',
        g_appContext.boardInfo.name,
        (g_appContext.boardInfo.type == 'group' ? '그룹' : '페이지')));
}

function onBtnBoardSearchAgainClick() {
    searchPage_start();
}