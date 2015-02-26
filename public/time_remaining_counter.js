var trs = io('/CT2'),
	running = true;

trs.on('time_remaining', function(tr) {
	console.log('Time remaining event fired, with param: ' + tr);
	var ctr_f = document.getElementById('ctr');
	if (tr > 0) {
		tr = Math.floor(tr / 1000);
		var secs = tr % 60,
			mins = Math.floor(tr / 60) % 60,
			hrs = Math.floor(tr / 360) % 24,
			secs_txt = ('00' + secs).slice(-2),
			mins_txt = ('00' + mins).slice(-2),
			hrs_txt = ('00' + hrs).slice(-2);
		ctr_f.innerHTML = 'Time remaining: ' + hrs_txt + ':' + mins_txt + ':' + secs_txt;
	} else {
		running=false;
		ctr_f.innerHTML = '<b>Time is up!</b>';
	}
});