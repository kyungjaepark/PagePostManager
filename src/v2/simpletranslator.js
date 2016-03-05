function SimpleTranslator() {
}

SimpleTranslator.prototype.translate = function (locale) {
    if (typeof locale === 'undefined')
        locale = window.navigator.userLanguage || window.navigator.language;

    if (locale == 'ko' || locale == 'koKR' || locale == 'ko-KR') {
		$("#btnLoadLikes").text("게시물 좋아요 추출");
		$("#btnLoadComments").text("게시물 댓글 추출");
		$("#lblSbOptAtt").text("첨부 사진 포함");
		$("#lblSbOptPostLikes").text("게시물 좋아요 여부(PostLike) 포함");
		$("#lblSbOptCommentLink").text("댓글 링크 보기");
		$("#lblSbNoteId").text("결과에 표시되는 유저 ID는, 실제 유저 ID가 아닌 App-scoped ID입니다. 다음 설명을 참조하세요 : ");
		$("#lblSbNoteLink").text("[링크]");
		$("#btnExportResultTable").text("결과를 엑셀 파일로 받기 (크롬 전용)");
		$("#btnShowResultTable").text("결과를 화면에 표시");
    }
}

