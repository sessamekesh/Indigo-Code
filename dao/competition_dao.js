/**
 * Created by Kamaron on 4/22/2015.
 */

// TODO KIP: Replace with Mongo access
exports.get_competition_data = function (comp_id, cb) {
    cb(null, {
        comp_id: comp_id,
        name: 'Test Previous Competition',
        start_date: 1429680148000,
        end_date: 1429690948000,
        problems: [0, 1, 2],
        max_team_size: 3,
        scoreboard: [{ user_id: 0, score: 2, time_penalty: 15 }, { user_id: 1, score: 2, time_penalty: 26 }]
    });
};

// TODO KIP: Replace with Mongo access
exports.get_previous_competitions = function (cb) {
    cb(null, [{
        comp_id: 0,
        name: 'Test Previous Competition 1',
        start_date: 1429680148000,
        end_date: 1429690948000,
        problems: [0, 1, 2],
        max_team_size: 3,
        scoreboard: [{ user_id: 0, score: 2, time_penalty: 15 }, { user_id: 1, score: 2, time_penalty: 26 }]
    }, {
        comp_id: 1,
        name: 'Test Previous Competition 2',
        start_date: 1429680148000,
        end_date: 1429690948000,
        problems: [3, 4, 5],
        max_team_size: 3,
        scoreboard: [ { user_id: 1, score: 2, time_penalty: 15 }, { user_id: 0, score: 1, time_penalty: 35 } ]
    }]);
};

// TODO KIP: Replace with Mongo access
exports.get_ongoing_competitions = function (cb) {
    cb(null, [{
        comp_id: 2,
        name: 'Test Ongoing Competition 1',
        start_date: 1429991073050,
        end_date: 1482695064000,
        problems: [6, 7, 8],
        max_team_size: 3,
        scoreboard: [{ user_id: 0, score: 2, time_penalty: 15 }, { user_id: 1, score: 2, time_penalty: 26 }]
    }, {
        comp_id: 3,
        name: 'Test Ongoing Competition 2',
        start_date: 1429991073000,
        end_date: 1482695064000,
        problems: [9, 10],
        max_team_size: 3,
        scoreboard: [{ user_id: 0, score: 2, time_penalty: 15 }, { user_id: 1, score: 2, time_penalty: 26 }]
    }]);
};

// TODO KIP: Replace with Mongo access
exports.get_upcoming_competitions = function (cb) {
    cb(null, [{
        comp_id: 4,
        name: 'Test Upcoming Competition 1',
        start_date: 1482695064000,
        end_date: 1482696084000,
        problems: [11, 12, 13, 14],
        max_team_size: 3,
        scoreboard: [{ user_id: 0, score: 2, time_penalty: 15 }, { user_id: 1, score: 2, time_penalty: 26 }]
    }, {
        comp_id: 5,
        name: 'Test Upcoming Competition 2',
        start_date: 1429991073000,
        end_date: 1482696084000,
        problems: [15, 16, 17, 18, 19],
        max_team_size: 3,
        scoreboard: [{ user_id: 0, score: 2, time_penalty: 15 }, { user_id: 1, score: 2, time_penalty: 26 }]
    }]);
};