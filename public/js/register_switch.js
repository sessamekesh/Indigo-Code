/**
 * Created by kamaron on 4/28/15.
 */

// When the document has loaded, set up registration switches
//  so that when an option is selected, that div is shown.
$(document).ready(function () {

    var max_team_size = $("#comp_data_max_team_size").val() || 0;

    // On select new user...
    for (var i = 0; i < max_team_size; i++) {
        activate_section(i);
    }
});

function activate_section(idx) {
    (function() {
        $("#usertype_" + idx).click(function () {
            var value = $("input:radio[name='usertype_" + idx + "']:checked").val() || 'blank';

            // Hide previous things...
            $("#new_user_" + idx).hide(400);
            $("#existing_user_" + idx).hide(400);

            // Should we hide old values, or not?
            $("#new_user_" + idx).find("input").val("").prop("required", false);
            $("#existing_user_" + idx).find("input").val("").prop("required", false);

            // Show the new thing...
            if (value === 'new') {
                $("#new_user_" + idx).show(400);
                $("#new_user_" + idx).find("input").val("").prop("required", true);
            } else if (value === 'existing') {
                $("#existing_user_" + idx).show(400);
                $("#existing_user_" + idx).find("input").val("").prop("required", true);
            }
        });
    })();
}