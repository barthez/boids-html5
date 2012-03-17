

//Initialize simulation, controls, etc.
(function(window, document, undefined) {
    window.addEventListener('load', function() {
	var canvas = document.getElementById('boids_canvas');
	var context = canvas.getContext('2d');

	var sim = new Simulation(context, 10);

	var settings_form = document.getElementById('settings');
	settings.addEventListener('submit', function(event) {
	    event.preventDefault();
	}, true);

	var play_button = document.getElementById('settings_play');
	play_button.addEventListener('click', function() {
	    sim.play();
	}, true);

	var pause_button = document.getElementById('settings_pause');
	pause_button.addEventListener('click', function() {
	    sim.pause();
	}, true);

	var boids_number = document.getElementById('settings_boids_number');
	boids_number.addEventListener('input', function(event) {
	    if (boids_number.validity.valid) {
		sim.updateBoidsNumber(boids_number.value);
	    }
	}, true);

	//Run simulation
	sim.run();

    }, true);

})(window, document);