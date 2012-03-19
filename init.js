

//Initialize simulation, controls, etc.
(function(window, document, undefined) {
    window.addEventListener('load', function() {
	var canvas = document.getElementById('boids_canvas');
	var context = canvas.getContext('2d');
	
	var canvas_size = new Vector(canvas.width -10, canvas.height-10);
	var boids_rules = [ new SteerToCenter(),
			    new KeepDistance(),
			    new KeepSpeed(),
			    new KeepInsideBox(new Vector(10,10), canvas_size),
			    new StaticForce( new Vector(0.02, 0) ),
			    new KeepOutsideCircle( new Vector( 100, 150), 50 ),
			    new KeepOutsideCircle( new Vector( 300, 400), 40 ),
			    new KeepOutsideCircle( new Vector( 500, 200), 30 ),
			    new KeepOutsideCircle( new Vector( 400, 600), 60 )
			  ];

	var sim = new Simulation(context, 10, boids_rules);

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

	canvas.addEventListener('click', function(event) {
	    console.log(event);
	    var point = new Vector(event.offsetX, event.offsetY);
	    sim.addBoidsRule( new AttractToPoint(point, 5000) ); 
	}, true);

	//Run simulation
	sim.run();

    }, true);

})(window, document);