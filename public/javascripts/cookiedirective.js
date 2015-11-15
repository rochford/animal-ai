$(document).ready(function() {
    $.cookiesDirective({
                           explicitConsent: false,
                           position: 'bottom',
        privacyPolicyUri: 'privacy-policy',
        fontColor: '#CA0000',
        backgroundColor: '#000000',
        backgroundOpacity: '99', // opacity of disclosure panel
    });
});
