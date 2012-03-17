

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
    ctx.fillStyle = this.color;
    var v_length = this.velocity.length();
    var sin = this.velocity.x/v_length;
    var cos = this.velocity.y/v_length;
    
    ctx.setTransform(cos,-sin,sin,cos,this.x, this.y);

    ctx.beginPath();
    if (THEME === 'fish') {
	ctx.moveTo(0,0);
	ctx.arc(0, 0, 3, Math.PI, 2*Math.PI, true);
	ctx.lineTo(0, -15);
	ctx.lineTo(-3, 0);
    } else {
	ctx.moveTo(0, 10);
	ctx.lineTo(6, -10);
	ctx.lineTo(-6, -10);
	ctx.lineTo(0,  10);
    }
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
	var power = 0.05;
	var d = 50;
 	if (b.x < d) {
	    vel.x = (d - b.x)*power;
	} else if (b.x > 800 - d) {
	    vel.x = (800 - d - b.x)*power;
	}

 	if (b.y < d) {
	    vel.y = (d - b.y)*power;
	} else if (b.y > 600 -d) {
	    vel.y = (600 -d - b.y)*power;
	}

	return vel;
    }
];

Boid.prototype.toString = function() {
    return this.id + " (" + this.x + ", " + this.y +")";
}

