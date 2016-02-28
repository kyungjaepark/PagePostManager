function SimpleTranslator() {
	this.reset();
}

SimpleTranslator.prototype.reset = function(){
}

SimpleTranslator.prototype.translate = function(locale){

	if (locale == 'ko' || locale == 'koKR' || locale == 'ko-KR')
	{
		$("#lblSbBigTitle").html('<small>페이스북용<br/></small>페이지/그룹 게시물 매니저');
		$("#lblSbWelcome").html('게시물 댓글을 추출하려고 "댓글 더 보기" 버튼을 누르느라 지치셨나요??<br/>'
			+ '페이지/그룹 게시물 매니저를 사용하면, 게시물에 달린 좋아요와 댓글을 간편하게 추출할 수 있습니다.<br/>'
			+ '클릭 한 번으로, 순식간에 모든 댓글과 좋아요를 모아보세요.');
		$("#lblSbLoginFailed").text("로그인 실패");
		$("#btnStart").html("Facebook에 로그인하고 시작 &raquo;");
		$("#lblSbLoginFailedDetail").text("로그인 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
		$("#lblSbGetAdminPages").text("내가 관리하는 페이지 보기");
		$("#lblSbPagesAdminPerm").text("참고 : 추가 권한이 필요합니다.");
		$("#btnPagesAdminRefresh").text("목록 표시");
		$("#lblSbSearchPages").text("페이지 이름으로 찾기");
		$("#btnPagesSearchRefresh").text("찾기");
		$("#lblSbGetAdminGroups").text("내가 관리하는 그룹 보기");
		$("#lblSbGroupsAdminPerm").text("참고 : 추가 권한이 필요합니다.");
		$("#btnGroupsAdminRefresh").text("목록 표시");
		$("#lblSbSearchGroups").text("그룹 이름으로 찾기");
		$("#btnGroupsSearchRefresh").text("찾기");
		$("#lblSbChoosePage").text("아래 페이지 중 하나를 선택하세요 : ");
		$("#lblSbChoosePost").text("아래 게시물 중 하나를 선택하세요 : ");
		$("#btnLoadLikes").text("게시물 좋아요 추출");
		$("#btnLoadComments").text("게시물 댓글 추출");
		$("#lblSbOptAtt").text("첨부 사진 포함");
		$("#lblSbOptPostLikes").text("게시물 좋아요 여부(PostLike) 포함");
		$("#lblSbOptCommentLink").text("댓글 링크 보기");
		$("#lblSbNoteId").text("아래 표시되는 ID는, 실제 유저 ID가 아닌 App-scoped ID입니다. 다음 설명을 참조하세요 : ");
		$("#lblSbNoteLink").text("[링크]");
		$("#btnExportResultTable").text("결과를 엑셀 파일로 받기 (크롬 전용)");
		$("#btnShowResultTable").text("결과를 화면에 표시");
	}
}

