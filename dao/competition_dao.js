/**
 * Created by Kamaron on 4/22/2015.
 */

exports.get_competition_data = function (comp_id, cb) {
    cb({
        comp_id: comp_id,
        comp_name: 'Test Previous Competition',
        start_date: 1429680148000,
        end_date: 1429690948000,
        problems: [0, 1, 2],
        scoreboard: [{ user_id: 0, score: 2, time_penalty: 15 }, { user_id: 1, score: 2, time_penalty: 26 }]
    });
};