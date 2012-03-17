
function ColorGenerator(colorArray) {
    this.lastColor = 0;
    this.colorArray = colorArray;
    if (colorArray.length == 0) {
	throw "Array of colors must contains at least one color";
    }
}

ColorGenerator.prototype.nextColor = function() {
    var color = this.colorArray[this.lastColor++];
    this.lastColor = this.lastColor % this.colorArray.length;
    return color;
}


function Vector(x,y) {
    this.x = x;
    this.y = y;
};

Vector.prototype.length = function() {
    return Math.sqrt( this.x*this.x + this.y*this.y );
};


Vector.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
};

Vector.prototype.copy = function() {
    return new Vector(this.x, this.y);
}

Vector.prototype.add = function( vector ) {
    //console.log("Adding: " + this + " + " + vector);
    this.x += vector.x;
    this.y += vector.y;
    return this;
};

Vector.prototype.diff = function( vector ) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
};

Vector.prototype.times = function( scalar ) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
};


Vector.prototype.draw = function (ctx) {
    ctx.fillStyle ="red";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, 2, -Math.PI, Math.PI, true);
    ctx.closePath();
    ctx.fill();
};

function Boid(id, x, y) {
    Vector.call(this, x, y);
    this.id = id;
    this.velocity = new Vector(0,0);
    this.color = "green";

}

Boid._last_id = 0;
Boid.getNextId = function () {
    return "boid_" + Boid._last_id++;
};

Boid.prototype = new Vector();
Boid.prototype.constructor = Boid;

Boid.prototype.draw = function(ctx) {
//    debugger
    ctx.fillStyle = this.color;
    var v_length = this.velocity.length();
    var sin = this.velocity.x/v_length;
    var cos = this.velocity.y/v_length;
    
    ctx.setTransform(cos,-sin,sin,cos,this.x, this.y);

    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(6, -10);
//    ctx.lineTo(0, -5);
    ctx.lineTo(-6, -10);
    ctx.lineTo(0,  10);
    ctx.closePath();
    ctx.fill();

//    ctx.setTransform(1,0,0,1,this.x, this.y);    
//    this.velocity.draw(ctx);
}

Boid.prototype.update = function(boids) {
//    console.log(this.toString());
//    console.log("Updating " + this.id);
//    if (this.color == '#000') {
//	debugger
//    }
    var v = new Vector(0,0);
    for(var i=0; i<this.rules.length; ++i) {
	var v1 = this.rules[i](this, boids);
//	debugger;
	v.add(v1);
    }
//    debugger
    this.velocity.add(v);
    var len = this.velocity.length();
    
    //Limit the speed
    var speed_limit = 5;
    if (len > speed_limit) this.velocity.times(speed_limit/len);

    this.add(this.velocity);
//    console.log(this.toString());
}

Boid.prototype.rules = [
    //RULE1: Go to center of swarm
    function(b, boids) {
	var vel = new Vector(0,0);
	
	for(var i=0; i < boids.length; ++i) {
	    if (boids[i].id != b.id) {
		//var v_diff = b.copy().diff(boids[i]);
		//if (v_diff.length() < 500) {
		    vel.add(boids[i]);
		//}
	    }
	}
	//debugger;
	return vel.times(1/(boids.length-1)).diff(b).times(1/500);
    },
    //RULE2: Keep distance from nearest boids
    function(b, boids) {
	var vel = new Vector(0,0);
 	
	for(var i=0; i < boids.length; ++i) {
	    if (boids[i].id != b.id) {
		var v_diff = b.copy().diff(boids[i]);
		if (v_diff.length() < 40) {
		    vel.diff(v_diff);
		}
	    }
	}
	//debugger;
	return vel.times(-1/100);
    },
    //RULE3: Keep mean velocity of swarm
    function(b, boids) {
	var vel = new Vector(0,0);
 	
	for(var i=0; i < boids.length; ++i) {
	    if (boids[i].id != b.id) {
		vel.add(b.velocity);
	    }
	}
	//debugger;
	return vel.times( 1/(boids.length-1) ).diff(b.velocity).times(1/50);
    },
    //RULE4: Don't go out of box
    function(b) {
	var vel = new Vector(0,0);
	var power = 10;
 	if (b.x < 10) {
	    vel.x = power;
	} else if (b.x > 790) {
	    vel.x = -power;
	}

 	if (b.y < 10) {
	    vel.y = power;
	} else if (b.y > 590) {
	    vel.y = -power;
	}

	return vel;
    }
];

Boid.prototype.toString = function() {
    return this.id + " (" + this.x + ", " + this.y +")";
}


function Simulation(ctx, boids_number) {
    if (!boids_number) boids_number = 10;
    this._ctx = ctx;
    this._boids = [];
    this._boids_number = boids_number;
    this._start_time = 0;
    this._last_time = 0;
    this._is_running = false;
    this._boids_color_generator = new ColorGenerator([
	'#000',
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
}

Simulation.prototype.run = function() {
    this._is_running = true;
    this.__init();
    this.__animate()
};

Simulation.prototype.play = function() {
    this._is_running = true;
    this.__animate()
};


Simulation.prototype.pause = function() {
    this._is_running = false;
};


Simulation.prototype.__init = function() {
    this._start_time = Date.now();
    //Add 10 boids
    for(var i=0; i<this._boids_number; ++i) {
	var x = (0.5 + Math.random() * 800) | 0;
	var y = (0.5 + Math.random() * 600) | 0;	    
	var b = new Boid(Boid.getNextId(), x, y);
	b.color = this._boids_color_generator.nextColor();
	this._boids.push(b);
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
/*    var time_diff = Date.now() - this._last_time;
    console.log(time_diff);
    if (time_diff > 2000) {
	this._last_time = Date.now();
	var x = (0.5 + Math.random() * 800) | 0;
	var y = (0.5 + Math.random() * 600) | 0;	    
	if(Math.random() > 0.5) {
	    this._bodies.push(new Boid(Boid.getNextId(), x, y));
	} else {
	    this._bodies.push(new Vector(x, y));
	}
    }
*/
    for(var i=0; i < this._boids.length; i++) {
	this._boids[i].update(this._boids);
    }
//    console.log("update");
};

Simulation.prototype.__draw = function() {
    this._ctx.setTransform(1,0,0,1,0,0);
    this._ctx.clearRect(0,0,800,600);
    for(var i=0; i < this._boids.length; i++) {
	this._boids[i].draw(this._ctx);
    }
};


(function(window, document, undefined) {
    window.addEventListener('load', function() {
	var canvas = document.getElementById('boids_canvas');
	var context = canvas.getContext('2d');

	var sim = new Simulation(context, 10);
	sim.run();

//	var drawRandomPoint = function() {
//	    var x = (0.5 + Math.random() * 800) | 0;
//	    var y = (0.5 + Math.random() * 600) | 0;
//	    var v = new Vector(x, y);
//	    v.draw(context);
//	    setTimeout(drawRandomPoint, 1000/60);
//	    console.log("x: " + x + " y: " + y);
//	};

//	drawRandomPoint();
    }, true);

})(window, document);