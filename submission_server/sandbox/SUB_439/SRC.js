process.stdin.resume();

process.stdin.setEncoding('utf8');

var mahData = '';

process.stdin.on('data', function (chunk) {
	mahData += chunk;
});

function fibb(n) {
	if (n < 2) {
		return 1;
	} else {
		var n1 = 1;
		var n2 = 1;
		var i = 2;
		var curr = n1 + n2;
		for (; i < n; i++) {
			n2 = n1;
			n1 = curr;
			curr = n1 + n2;
		}
		return curr;
	}
}

process.stdin.on('end', function() {
	var lines = mahData.split('\n');
	for (var i = 1; i < lines.length; i++) {
		if (lines[i] !== '') {
			process.stdout.write(fibb(+lines[i]) + '\n');
		}
	}
});
