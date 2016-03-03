
var g_appConfig =
    {
        requiredScopes: [],
        appId: '624861190962222'
    }

function main() {
    var locale = getParamMap()['lang'];
    if (is_defined(locale) == false)
        locale = window.navigator.userLanguage || window.navigator.language;
    new SimpleTranslator().translate(locale);

    fbmanager.jQueryInit(g_appConfig.appId, onFbInitialized);    
}

function onFbInitialized() {
    console.log('onFbInitialized');
    console.log(fbmanager.user_granted_scopes);
    console.log(fbmanager.user_login_status);
    console.log(fbmanager.user_uid);
    console.log(fbmanager.user_accessToken);
}

$().ready(function () { main(); });
