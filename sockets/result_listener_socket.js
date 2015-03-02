'use strict';

var problem_result_broadcasters = {},
	socket_router = require('./socket_router');

// NEXT VERSION: Cleanup sockets, maybe have a timer so that if they aren't used
//  in 20 minutes or so they get removed?

exports.requestResultListener = function (problemData) {
	if (problem_result_broadcasters[problemData.id] === undefined) {
		problem_result_broadcasters[problemData.id] = {
			n_connections: 0,
			socket: {
				namespace: '/PR' + problemData.id,
				on_connect: function (socket) {
					problem_result_broadcasters[problemData.id].n_connections++;
					if (problem_result_broadcasters[problemData.id].n_connections === 1) {
						console.log('results_listener_socket: Activated result listener socket /PR' + problemData.id);
					}

					socket.on('disconnect', function() {
						problem_result_broadcasters[problemData.id].n_connections--;
						if (problem_result_broadcasters[problemData.id].n_connections === 0) {
							console.log('results_listener_socket: Broadcasting for problem /PR' + problemData.id + ' will stop.');
						}
					});
				}
			}
		};

		problem_result_broadcasters[problemData.id].io = socket_router.AddSocketRouter(
			problem_result_broadcasters[problemData.id].socket);
	}
}

exports.broadcastResult = function (problemID, submissionID, result, notes) {
	console.log('Broadcasting result to submission ' + submissionID + ': ' + result);
	if (problem_result_broadcasters[problemID] === undefined) {
		console.log('results_listener_socket: ERR undefined broadcaster for problem ID ' + problemID);
	} else {
		if (problem_result_broadcasters[problemID].io !== undefined
			&& problem_result_broadcasters[problemID].n_connections > 0) {
			problem_result_broadcasters[problemID].io.emit(
				'submission_finished',
				{
					id: submissionID,
					problem_id: problemID,
					result: result,
					notes: notes
				}
			);
		}
	}
}