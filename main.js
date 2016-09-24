var getResponsesIntervalId
  , interval = 10000
  , jwt
  , responses;

var updatePage = function (rsps) {
    responses = rsps;
    console.log(responses)

    $('.responses:not(.template)').remove();

    var newRows = '';
    var newTable = $('.responses.template').clone();

    responses.forEach(function (data) {
        newRow = '<tr id="' + data._id + '"><td>' + data.firstName +
                 '</td><td>' + data.lastName + '</td><td>' + data.email + '</td></tr>';
        newRows += newRow;
    });

    newTable.append(newRows);
    newTable.removeClass('template');
    console.log(newTable.html())
    $('#tableDiv').append(newTable);

    $('tr').on('click', function (e) {
        var targetElement = e.target.parentElement
        var targetResponse = responses.filter((r) => { return '' + r._id === targetElement.id })[0];
        console.log(targetResponse);
        var pretty = '<dl>'
        for (let k of Object.keys(targetResponse)) {
            if (k === 'raw') {
              var raw = targetResponse[k]
              for (let innerk of Object.keys(raw)) {
                pretty += '<dt>' + innerk + '</dt>'
                          + '<dd>' + raw[innerk] + '</dd>'
              }
            } else {
              pretty += '<dt>' + k + '</dt>' + '<dd>'
                        + targetResponse[k]
                        + '</dd>'
            }
        }
        pretty += '</dl>'
        $('#preTag').html(pretty);
    });

    $('#responseCount').text(responses.length);
}

var getResponses = function () {
    $.ajax({
        type: 'GET',
        url: 'https://nuisepic.com/api/recruitment/responses',
        dataType: 'json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + jwt);
        },
        success: function(response) {
            updatePage(response)
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            clearInterval(getResponsesIntervalId);
            getResponsesIntervalId = undefined;
            alert('Please reauthenticate to continue using the dashboard.');
        }
    });
}

var authenticate = function (username, password, callback) {
    $.ajax({
        type: 'POST',
        url: 'https://nuisepic.com/api/authenticate',
        dataType: 'json',
        data: {
            username: username,
            password: password,
        },
        success: function(response) {
            jwt = response;
            getResponses();
            if (getResponsesIntervalId === undefined)
                getResponsesIntervalId = setInterval(getResponses, interval);
            callback(true);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            callback(false);
        }
    });
}

$(document).ready(function() {
    $('#loginForm').submit(function (e) {
        e.preventDefault();
        authenticate($('#loginUsername').val(), $('#loginPassword').val(), function (bool) {
            if (bool) alert('You have been logged in successfully.');
            else alert('Incorrect username or password.');
        });
    });
});
