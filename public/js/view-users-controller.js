/**
 * Created by Kamaron on 6/22/2015.
 */

$(function() {
    $('table a').each(function() {
        $(this).on('click', function() {
            var user_id = $(this).attr('data-user-id');
            $.get('/user/participation?id=' + user_id, function (data) {
                var dialog = $('#user-participation-dialog');
                // TODO: I'm sure there's a more elegant way than this, I'm just not in the mood right now
                //  I'm thinking like dialog.children.appendChild('table')... etc, etc. Append rows, etc.
                // TODO: Also, instead of just data fields, make both items links, where you can click and go to either the competition or the team data page.
                var bodyHTML = '<table><tr><th>Competition Name</th><th>Team Name</th></tr>';
                for (var i = 0; i < data.participation.length; i++) {
                    bodyHTML += '<tr><td>' + data.participation[i].compName + '</td><td>' +
                            data.participation[i].teamName + '</td></tr>';
                }
                bodyHTML += '</table>';
                dialog.children('p').html(bodyHTML);
                dialog.removeClass('hidden');
                dialog.dialog();
            }).error(function (xhr) {
                var responseData = xhr.responseJSON;
                var dialog = $('#user-participation-dialog');
                dialog.removeClass('hidden');
                dialog.attr('title', 'Error fetching participation data');
                dialog.children('p').html(
                    '<h3>Error fetching participation</h3><p>' + responseData.error + '</p>'
                );
                dialog.dialog();
            });
        });
    });
});