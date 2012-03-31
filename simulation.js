
function Simulation(ctx, boids_number, boids_rules, pred_num, pred_rules) {
    if (!boids_number) boids_number = 10;
    if (!boids_rules || boids_rules.length == 0) {
	boids_rules = BehaviourRule.DefaultBoidsRules();
    }
    if (!pred_num && pred_num !== 0) pred_num = 1;
    if (!pred_rules || pred_rules.length == 0) {
	pred_rules = BehaviourRule.DefaultPredatorsRules();
    }
    this._ctx = ctx;
    this._boids = [];
    this._boids_number = boids_number;
    this._pred = [];
    this._pred_number = pred_num;
    this._start_time = 0;
    this._last_time = 0;
    this._is_running = false;
    this._boids_color_generator = new ColorGenerator([
	'#ff4040',
	'#ff0000',
	'#a60000',
	'#bf7130',
	'#ff7400',
	'#ffb273',
	'#1d7373',
	'#009999',
	'#5ccccc',
	'#269926',
	'#0c0',
	'#67e667'
    ]);
    this._pred_color_generator = new ColorGenerator([
	'#ddd',
	'#ccc',
	'#bbb',
	'#aaa'
    ]);
    this.boids_rules = boids_rules;
    this.pred_rules = pred_rules;

    this.__init();
}

Simulation.prototype.run = function() {
    this._is_running = true;
    this.__animate()
};

Simulation.prototype.play = function() {
    if(this._is_running) return false;
    this._is_running = true;
    this.__animate()
    return true;
};


Simulation.prototype.pause = function() {
    this._is_running = false;
    return true;
};


Simulation.prototype.updateBoidsNumber = function(number) {
    if(!number || number < 1) number = 1;
    var diff = number - this._boids.length;
    if (diff > 0) {
	for(var i=0; i<diff; ++i) {
	    var x = (0.5 + Math.random() * 800) | 0;
	    var y = (0.5 + Math.random() * 600) | 0;	    
	    var b = new Boid(Boid.getNextId(), x, y);
	    b.color = this._boids_color_generator.nextColor();
	    b.rules = this.boids_rules;
	    this._boids.push(b);
	}
	this._boids_number = this._boids.length;
	return diff;
    } else if (diff < 0) {
	var d = Math.abs(diff);
	this._boids.splice(this._boids.length-d,d);
	this._boids_number = this._boids.length;
	return diff;
    }
    return 0;
};

Simulation.prototype.updatePredNumber = function(number) {
    if(!number || number < 0) number = 0;
    var diff = number - this._pred.length;
    if (diff > 0) {
	for(var i=0; i<diff; ++i) {
	    var x = (0.5 + Math.random() * 800) | 0;
	    var y = (0.5 + Math.random() * 600) | 0;	    
	    var p = new Predator(Predator.getNextId(), x, y);
	    p.color = this._pred_color_generator.nextColor();
	    p.rules = this.pred_rules;
	    this._pred.push(p);
	}
	this._pred_number = this._boids.length;
	return diff;
    } else if (diff < 0) {
	var d = Math.abs(diff);
	this._pred.splice(this._pred.length-d,d);
	this._pred_number = this._boids.length;
	return diff;
    }
    return 0;
};

Simulation.prototype.addBoidsRule = function(rule) {
    this.boids_rules.push(rule);

//    for(var i=0; i < this._boids.length; i++) {
//	this._boids[i].rules.push(rule);
//    }    
};



Simulation.prototype.__init = function() {
    this._start_time = Date.now();
    for(var i=0; i<this._boids_number; ++i) {
	var x = (0.5 + Math.random() * 800) | 0;
	var y = (0.5 + Math.random() * 600) | 0;	    
	var b = new Boid(Boid.getNextId(), x, y);
	b.color = this._boids_color_generator.nextColor();
	b.rules = this.boids_rules;
	this._boids.push(b);
    }
//    debugger
    for(var i=0; i<this._pred_number; ++i) {
	var x = (0.5 + Math.random() * 800) | 0;
	var y = (0.5 + Math.random() * 600) | 0;	    
	var p = new Predator(Predator.getNextId(), x, y);
	p.color = this._pred_color_generator.nextColor();
	p.rules = this.pred_rules;
	this._pred.push(p);
    }

};

Simulation.prototype.__animate = function() {
    if (this._is_running) {
	requestAnimationFrame(this.__animate, this);
    }
    this.__update();
    this.__draw();
};

Simulation.prototype.__update = function() {
    for(var i=0; i < this._boids.length; i++) {
	this._boids[i].update(this._boids, this._pred);
    }

    for(var i=0; i < this._pred.length; i++) {
//	debugger
	this._pred[i].update(this._boids, this._pred);
    }

    //Remove dead boids
    var any_dead = true;
    var deads = 0;
    while( any_dead ) {
	
	any_dead = false;
	for(var i=0; !any_dead && i < this._boids.length; i++) {
	    any_dead = ! this._boids[i].is_alive;
	}
	var to_kill = this._boids.splice(i - any_dead,1);
	delete to_kill[0];
	deads += any_dead;
    }
    this._boids_number -= deads;
    if (deads > 0) {
	var event = document.createEvent("Event");
	event.simulation = this;
	event.initEvent("simulation:update:boids_number_value_changed", true, false);
	document.dispatchEvent(event);
    }

};

Simulation.prototype.__draw = function() {
    this._ctx.setTransform(1,0,0,1,0,0);
    this._ctx.clearRect(0,0,800,600);

    for(var i=0; i < this.boids_rules.length; i++) {
	this.boids_rules[i].draw(this._ctx);
    }

    for(var i=0; i < this._boids.length; i++) {
	this._boids[i].draw(this._ctx);
    }

    for(var i=0; i < this._pred.length; i++) {
	this._pred[i].draw(this._ctx);
    }

    
    

};

