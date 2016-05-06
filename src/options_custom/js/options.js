var inputEmail = document.getElementById('email');
var registerBtn = document.getElementById('registerBtn');
var resetBtn = document.getElementById('resetBtn');
var checkValidationStatusBtn = document.getElementById('checkValidationStatusBtn');


registerBtn.addEventListener('click', function ()
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://robot.fwrdto.me/chrome/register');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var apiKey = JSON.parse(xhr.response);
            swal("Confirmation link sent!", "We just emailed you a confirmation link to check your email address! Thank you!", "success")
            chrome.storage.sync.set({'apiKey': apiKey}, function() {
                displayErrors();
            });
        }
    };
    xhr.send(JSON.stringify({
        email: inputEmail.value
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
        if (res.apiKey.status === 'NEED_CHECK') {
            document.getElementById('error_need_check').style.display = 'block';
        } else if (res.apiKey.status === 'OK') {
            document.getElementById('success').style.display = 'block';
        } else if (res.apiKey.status === 'REVOKED') {
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
        xhr.open('POST', 'https://robot.fwrdto.me/chrome/ping');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                var apiKeyUpdated = JSON.parse(xhr.response);
                chrome.storage.sync.set({'apiKey': apiKeyUpdated}, function() {
                    displayErrors();
                });
            }
        };
        xhr.send(JSON.stringify({
            apiKey: res.apiKey.uuid
        }));
    });
}

function populateFields()
{
    chrome.storage.sync.get('apiKey', function(res)
    {
        if (typeof res.apiKey === 'undefined')
            return;

        document.getElementById('email').value = res.apiKey.email;
    });
}

updateApiKey();
populateFields();