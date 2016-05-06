chrome.browserAction.onClicked.addListener(function(tab)
{
    sendLink(tab.title, tab.url);
});

function sendLink(title, url)
{
    chrome.storage.sync.get('apiKey', function(res)
    {
        if (typeof res.apiKey === 'undefined' || res.apiKey.status !== 'OK') {
            chrome.runtime.openOptionsPage();
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://robot.fwrdto.me/chrome/send');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log(JSON.parse(xhr.response));
                chrome.notifications.create('', {
                    type: 'basic',
                    iconUrl: '../../icons/icon128.png',
                    title: 'Link sent!',
                    message: 'Fwrdto.me'
                })
            }
        };
        xhr.send(JSON.stringify({
            api: res.apiKey.uuid,
            url: url,
            title: title
        }));
    });
}