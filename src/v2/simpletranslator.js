SimpleTranslator = {
    locale: '',
    init(param_locale) {
        if (typeof param_locale === 'undefined')
            locale = window.navigator.userLanguage || window.navigator.language;
        else
            locale = param_locale;
    },
    translate: function () {

        if (locale == 'ko' || locale == 'koKR' || locale == 'ko-KR') {
            $("#lblSbBigTitle").html('PagePostManager v2 :: 페이스북용 페이지/그룹 게시물 매니저');
            $("#lblSbWelcome").html('게시물 댓글을 추출하려고 "댓글 더 보기" 버튼을 누르느라 지치셨나요??<br/>'
                + '클릭 한 번으로, 순식간에 모든 댓글과 좋아요를 모아보세요.');
            $('#sb-temp-v1').html("<br/> 이전 버전을 사용하고 싶으신 분은 <a href='./v1/'><u>이곳</u></a>을 클릭해주세요.");
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

            $("#btn-board-search-again").text("페이지/그룹 검색으로 돌아가기");
            $("#board-name").text("게시물 목록");
            $("#btn-board-post-list-more").text("더 보기");

            $("#btn-goto-search").text("페이지/그룹 검색으로 이동");
            $("#btn-goto-post-list").text("게시물 목록으로 돌아가기");
            $("#btnLoadLikes").text("게시물 좋아요 추출");
            $("#btnLoadComments").text("게시물 댓글 추출");
            $("#lblSbOptAtt").text("첨부 사진 포함");
            $("#lblSbOptPostLikes").text("게시물 좋아요 여부(PostLike) 포함");
            $("#lblSbOptCommentLink").text("댓글 링크 보기");
            $("#lblSkipError").text("에러 발생 시 해당 댓글/좋아요 제외");
            $("#lblSbNoteId").text("결과에 표시되는 유저 ID는, 실제 유저 ID가 아닌 App-scoped ID입니다. 다음 설명을 참조하세요 : ");
            $("#lblSbNoteLink").text("[링크]");
            $("#btnExportResultTable").text("결과를 엑셀 파일로 받기 (크롬 전용)");
            $("#btnShowResultTable").text("결과를 화면에 표시");
            $("#btnShowResultTableNewWindow").text("새 창에 결과 테이블 표시");
        }
    },
    getKey: function (key) {
        if (locale == 'ko' || locale == 'koKR' || locale == 'ko-KR') {
            if (key == 'fatal_error') return '정보를 읽어오는 데 실패했습니다. 새로고침 후 다시 시도해 주세요.';
            if (key == 'post_list_title_format') return '[{0}] {1}의 게시물';
            if (key == 'group') return '그룹';
            if (key == 'page') return '페이지';

        }
        else {
            if (key == 'fatal_error') return 'Error retrieveing data. Please refresh page and try again.';
            if (key == 'post_list_title_format') return 'Post list of [{0}] {1}';
            if (key == 'group') return 'group';
            if (key == 'page') return 'page';
        }


    }

};
