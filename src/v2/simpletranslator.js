function SimpleTranslator() {
}

SimpleTranslator.prototype.translate = function (locale) {
    if (typeof locale === 'undefined')
        locale = window.navigator.userLanguage || window.navigator.language;

    if (locale == 'ko' || locale == 'koKR' || locale == 'ko-KR') {
        $("#welcome").text('환영합니다 :: v2.');
    }
}

