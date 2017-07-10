var API_ENDPOINT = "https://fwrdto.me/api";

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        title: 'Send to my inbox',
        id: 'send',
        contexts: ['link']
    });
});

chrome.contextMenus.onClicked.addListener(function(context, tab) {
    if (context.menuItemId === "send") {
        sendLink(context.selectionText, context.linkUrl);
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    sendLink(tab.title, tab.url);
});

function sendLink(title, url)
{
    chrome.storage.sync.get(['apiKey', 'settings'], function(res)
    {
        if (typeof res.apiKey === 'undefined' || res.apiKey.status !== 'ok') {
            chrome.runtime.openOptionsPage();
            return;
        }

        var params = "?preview=" + (res.settings.preview ? "yes" : "no") + "&queued=" + (res.settings.queued ? "yes" : "no") + "&api-key=" + res.apiKey.uuid + "&link=" + url;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', API_ENDPOINT + '/send' + params);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                chrome.notifications.create('', {
                    type: 'basic',
                    iconUrl: '../../icons/icon128.png',
                    title: 'fwrdto.me',
                    message: title + " is on its way to your inbox!"
                })
            }
        };
        xhr.send();
    });
}