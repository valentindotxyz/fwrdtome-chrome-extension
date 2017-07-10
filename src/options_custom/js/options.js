var API_ENDPOINT = "https://fwrdto.me/api";

var inputEmail = document.getElementById('email');
var registerBtn = document.getElementById('registerBtn');
var resetBtn = document.getElementById('resetBtn');
var checkValidationStatusBtn = document.getElementById('checkValidationStatusBtn');

var options = document.getElementById('options');
var checkboxPreviews = document.getElementById('checkboxPreviews');
var checkboxQueued = document.getElementById('checkboxQueued');

registerBtn.addEventListener('click', function ()
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API_ENDPOINT + '/register');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var apiKey = JSON.parse(xhr.response);
            swal("Confirmation link sent!", "We just emailed you a link to confirm your email.", "success")
            chrome.storage.sync.set({
                    apiKey: apiKey,
                    settings: { preview: true, queued: false }
                },
                function() {
                    displayErrors();
                });
        }
    };
    xhr.send(JSON.stringify({
        email: inputEmail.value,
        source: "chrome"
    }));
});

resetBtn.addEventListener('click', function ()
{
    swal({
            title: "Are you sure?",
            text: "You're about to reset your account!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, reset it!",
            closeOnConfirm: false },
        function() {
            chrome.storage.sync.clear();
            window.location.reload();
        });
});

checkValidationStatusBtn.addEventListener('click', function()
{
    updateApiKey();
});

checkboxPreviews.addEventListener('change', updateSetting);
checkboxQueued.addEventListener('change', updateSetting);

function displayErrors(error)
{
    _.each(document.getElementsByClassName('error'), function(el) {
        el.style.display = 'none'
    });

    if (typeof error !== 'undefined') {
        document.getElementById(error).style.display = 'block';
        return;
    }

    chrome.storage.sync.get('apiKey', function(res)
    {
        if (res.apiKey.status === 'need_check') {
            document.getElementById('error_need_check').style.display = 'block';
        } else if (res.apiKey.status === 'ok') {
            document.getElementById('success').style.display = 'block';
        } else if (res.apiKey.status === 'revoked') {
            document.getElementById('error_revoked').style.display = 'block';
        }
    });
}

function updateApiKey()
{
    chrome.storage.sync.get('apiKey', function(res)
    {
        if (typeof res.apiKey === 'undefined') {
            displayErrors('error_enter_email');
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', API_ENDPOINT + '/check?api-key=' + res.apiKey.uuid);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                var apiKeyUpdated = JSON.parse(xhr.response);
                chrome.storage.sync.set({
                        apiKey: apiKeyUpdated
                    },
                    function() {
                        displayErrors();
                        populateFields();
                    });
            }
        };
        xhr.send();
    });
}

function updateSetting(event)
{
    chrome.storage.sync.get('settings', function(res)
    {
        if (typeof res.settings === 'undefined')
            return;

        var updatedSettings = res;

        console.log('[VP]', 'updated', updatedSettings);

        updatedSettings["settings"][event.target.name] = event.target.checked;

        chrome.storage.sync.set(updatedSettings);
    });
}

function populateFields()
{
    chrome.storage.sync.get('apiKey', function(res)
    {
        if (typeof res.apiKey === 'undefined')
            return;

        inputEmail.value = res.apiKey.email;
    });

    chrome.storage.sync.get('settings', function(res)
    {
        if (typeof res.settings === 'undefined')
            return;

        options.classList.remove('hidden');
        checkboxPreviews.checked = res.settings.preview;
        checkboxQueued.checked = res.settings.queued;
    });
}

updateApiKey();
populateFields();