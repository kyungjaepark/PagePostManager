function SimpleTranslator() {
	this.reset();
}

SimpleTranslator.prototype.reset = function(){
}

SimpleTranslator.prototype.translate = function(locale){

	if (locale == 'ko' || locale == 'koKR' || locale == 'ko-KR')
	{
		$("#welcome").text('환영합니다 :: v2.');
	}
}

