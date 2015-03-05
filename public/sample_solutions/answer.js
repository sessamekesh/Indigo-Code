// Boilerplate...
process.stdin.resume();
process.stdin.setEncoding('utf8');
var data = '';

// Read input...
process.stdin.on('data', function (chunk) {
	data += chunk;
});
process.stdin.on('end', function () {
	solve_problem();
});

function solve_problem() {
	// For this problem, we just want to grab the first number,
	//  and output 42 to the console that number of times.
	var lines = data.split('\n');
	var t = parseInt(lines.shift());
	for (var i = 0; i < t; i++) {
		console.log(42);
	}
}