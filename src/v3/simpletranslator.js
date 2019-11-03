SimpleTranslator = {
    locale: '',
    init: function (param_locale) {
        if (typeof param_locale === 'undefined')
            locale = window.navigator.userLanguage || window.navigator.language;
        else
            locale = param_locale;
    },
    translate: function () {

        if (locale == 'ko' || locale == 'koKR' || locale == 'ko-KR') {
            $("#lblSbBigTitle").html('PagePostManager v3 :: 페이스북용 페이지/그룹 게시물 매니저');
            $("#lblSbWelcome").html('게시물 댓글을 추출하려고 "댓글 더 보기" 버튼을 누르느라 지치셨나요??<br/>'
                + '클릭 한 번으로, 순식간에 모든 댓글과 좋아요를 모아보세요.');
            $('#sb-locale').html("추출 시 기본 언어 : ");
            $('#sb-connecting-to-facebook').text('페이스북에 연결 중입니다.');
            $('#sb-connecting-to-facebook-2').text('(이 화면에서 10초 이상 진행이 멈춰 있다면 새로고침을 눌러주세요.)');

            $("#sb-welcome").text("환영합니다!");
            $("#sb-intro").text("PagePostManager를 이용하여 페이지/그룹의 좋아요와 댓글을 손쉽게 추출할 수 있습니다.");
            $("#login-required").text("실행을 위해서는 페이스북에서 앱 사용을 허가해야 합니다.");
            $("#btn-basic-login").text("로그인하고 시작하기");

            $("#sb-show-admin").text("내가 관리하는 페이지/그룹 보기");
            $("#sb-extra-permission").text("참고 : 추가 권한이 필요합니다.");
            $("#btn-search-my-pages").text("내 페이지 보기");
            $("#btn-search-my-groups").text("내 그룹 보기");
            $("#sb-search-by-name").text("페이지/그룹 이름으로 검색하기");
            $("#btn-search-page").text("페이지 찾기");
            $("#btn-search-group").text("그룹 찾기");
            $("#btn-search-result-more").text("더 보기");
            $("#sb-search-page-empty").text("검색 결과가 없습니다. 다른 검색어를 입력해 보세요.");
            $("#hotfix-reload").text("만약 페이지 목록을 얻는 데 계속 문제가 있다면, 이 버튼을 눌러 앱 설정 초기화를 진행해주세요.");
            $("#btn-reset").text("앱 설정 초기화");

            $("#btn-board-search-again").text("페이지/그룹 검색으로 돌아가기");
            $("#board-name").text("게시물 목록");
            $("#btn-board-post-list-more").text("더 보기");

            $("#btn-goto-search").text("페이지/그룹 검색으로 이동");
            $("#btn-goto-post-list").text("게시물 목록으로 돌아가기");
            $("#btnLoadReactions").text("게시물 반응 추출");
            $("#btnLoadComments").text("게시물 댓글 추출");
            $("#lblSbOptAtt").text("첨부 사진 포함");
            $("#lblSbOptPostReactions").text("게시물 반응 여부(PostReaction) 포함");
            $("#lblSbOptCommentLink").text("댓글 링크 보기");
            $("#lblSkipUnknownUser").text("사용자 정보를 확인할 수 없는 댓글 제외");
            $("#lblShowTopInfo").text("댓글 추출 결과 테이블 상단에 추가 정보 표시");
            $("#lblTokenNotice").html("2018.2.5 이후 페이스북 정책 변경으로 인한 중요 공지<br/>좋아요/댓글 추출을 위해서는, 해당 페이지에 대해 <b>'분석자'</b> 이상의 역할이 있어야 합니다.");
            $("#lblBreakingChanges20180419").html(
                "<strong>중요 변경 사항</strong><br/>"
                + "2018년 4월 19일부터, 좋아요/댓글을 남긴 유저 페이지로 가는 링크가 차단되었습니다."
                + "<br/> 유저 페이지를 방문하기 위해서는, 결과 표에 표시되는 '<stron><u>댓글 링크 (Comment Link)</u></strong>' 를 눌러 해당 댓글을 표시한 후 방문이 가능합니다."
                + "<br/> 이로 인해 기존에 유저 이름에 걸려 있던 링크는 모두 '댓글 링크' 로 대체되었습니다."
                + "<br/> Facebook 정책이 바뀔 때까지 이 방식은 계속 유지됩니다."
                + "<br/> 참고 링크 :"
            );

            $("#lblResultDownload").text("다운로드 (구글 Chrome 전용)");
            $("#btnExportResultTable").text("결과 표 (.xls)");
            $("#btnExportResultTableXlsx").text("결과를 엑셀 .xlsx 파일로 받기 (크롬 전용, 실험적 기능, 빠름)");
            $("#btnExportResultAttachmentsZip").text("결과 표 + 첨부 이미지(.zip)");
            $("#lblResultShow").text("결과 직접 표시");
            $("#btnShowResultTable").text("현재 창에 표시");
            $("#btnShowResultTableNewWindow").text("새 창에 표시");

            $("#lblReportOption").text("보고서 옵션");
            $("#lblReportResult").text("보고서 결과");
            $("#btnChangeOption").text("보고서 옵션 조정");

            $("#sb-extract-from-comment-plugin").text("페이스북 댓글 소셜 플러그인 결과 추출");
            $("#btn-parse-comment-plugin").text("결과 추출");
            $("#sb-comment-plugin-data-href").text("data-href값 (URL)");
        }
    },
    getKey: function (key) {
        if (locale == 'ko' || locale == 'koKR' || locale == 'ko-KR') {
            if (key == 'fatal_error') return '정보를 읽어오는 데 실패했습니다. 새로고침 후 다시 시도해 주세요.';
            if (key == 'post_list_title_format') return '[{0}] {1}의 게시물';
            if (key == 'group') return '그룹';
            if (key == 'page') return '페이지';
            if (key == 'from_not_found') return '{0}건의 항목에서 사용자 ID/이름을 추출할 수 없었습니다.\n해당 ID와 이름은 (Error)로 표시됩니다.';

        }
        else {
            if (key == 'fatal_error') return 'Error retrieveing data. Please refresh page and try again.';
            if (key == 'post_list_title_format') return 'Post list of [{0}] {1}';
            if (key == 'group') return 'group';
            if (key == 'page') return 'page';
            if (key == 'from_not_found') return 'Could not extract user ID/name from {0} entries\nThe ID/name of those entries is now replaced with "(Error)".';
        }


    }

};
