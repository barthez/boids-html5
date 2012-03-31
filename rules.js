
function BehaviourRule() {

}

BehaviourRule.DefaultBoidsRules = function() {
    return [ new SteerToCenter(),
	     new KeepDistance(),
	     new KeepSpeed() ];
};

BehaviourRule.DefaultPredatorsRules = function() {
    return [ new KeepDistance(),
	     new ChasePray() ];
};


BehaviourRule.prototype.computeVelocity = function(boid, boids, predators) {
    return new Vector(0,0);
};

BehaviourRule.prototype.draw = function(ctx) {
    return true;
};

function SteerToCenter() {

}

SteerToCenter.prototype = new BehaviourRule();
SteerToCenter.prototype.constructor = SteerToCenter;

SteerToCenter.prototype.computeVelocity = function(boid, boids, predators) {
    var v = new Vector(0,0);
    if (boids.length <= 1) return v;

    for(var i=0; i < boids.length; ++i) {
	if (boids[i].id != boid.id) {
	    v.add(boids[i]);
	}
    }
    return v.times(1/(boids.length-1)).diff(boid).times(1/500);
};

function KeepDistance() {

}

KeepDistance.prototype = new BehaviourRule();
KeepDistance.prototype.constuctor = KeepDistance;

KeepDistance.prototype.computeVelocity = function(boid, boids, predators) {
    var v = new Vector(0,0);
    if (boid instanceof Predator) {
	if (predators.length <= 1) return v;

	for(var i=0; i < predators.length; ++i) {
	    if (predators[i].id != boid.id) {
		var v_diff = boid.copy().diff(predators[i]);
		if (v_diff.length() < 30) {
		    v.diff(v_diff);
		}
	    }
	}
	return v.times(-1/30);
    } else {
	if (boids.length <= 1) return v;

	for(var i=0; i < boids.length; ++i) {
	    if (boids[i].id != boid.id) {
		var v_diff = boid.copy().diff(boids[i]);
		if (v_diff.length() < 30) {
		    v.diff(v_diff);
		}
	    }
	}
	return v.times(-1/30);
    }
    return v;
};


function KeepSpeed() {

}

KeepSpeed.prototype = new BehaviourRule();
KeepSpeed.prototype.constuctor = KeepSpeed;

KeepSpeed.prototype.computeVelocity = function(boid, boids, predators) {
    var v = new Vector(0,0);
    if (boids.length <= 1) return v;

    for(var i=0; i < boids.length; ++i) {
	if (boids[i].id != boid.id) {
	    v.add(boids[i].velocity);
	}
    }
    return v.times( 1/(boids.length-1) ).diff(boid.velocity).times(1/50);
};

function KeepInsideBox(up_left, bottom_right) {
    this.left = up_left.x;
    this.top = up_left.y;
    this.right = bottom_right.x;
    this.bottom = bottom_right.y;

    this.distance = 10;
    this.power = 0.1;
    this.blocking_power = 10;
};

KeepInsideBox.prototype = new BehaviourRule();
KeepInsideBox.prototype.constuctor = KeepInsideBox;

KeepInsideBox.prototype.computeVelocity = function(boid, boids, predators) {
    	var vel = new Vector(0,0);
	var power = this.power;
	var d = this.distance;
/*
 	if (boid.x < this.left + d) {
	    vel.x = (this.left + d - boid.x)*power;
	    if (boid.x <= this.left && !(boid instanceof Predator)) {
		vel.x = this.blocking_power;
	    }
	} else if (boid.x > this.right - d) {
	    vel.x = (this.right - d - boid.x)*power;
	    if (boid.x >= this.right && !(boid instanceof Predator)) {
		vel.x = -this.blocking_power;
	    }
	}

 	if (boid.y < this.top + d) {
	    vel.y = (this.top + d - boid.y)*power;
	    if (boid.y <= this.top && !(boid instanceof Predator)) {
		vel.y = this.blocking_power;
	    }
	} else if (boid.y > this.bottom - d) {
	    vel.y = (this.bottom - d - boid.y)*power;
	    if (boid.y >= this.bottom && !(boid instanceof Predator)) {
		vel.y = -this.blocking_power;
	    }
	}
*/
 	if (boid.x < this.left + d) {
	    var dx = this.left + d - boid.x;
	    vel.x = Math.abs(boid.velocity.x * dx) + power;
	} else if (boid.x > this.right - d) {
	    var dx = this.right - d - boid.x;
	    vel.x = -Math.abs(boid.velocity.x * dx) - power;
	}

 	if (boid.y < this.top + d) {
	    var dy = this.top + d - boid.y;
	    vel.y = Math.abs(boid.velocity.y * dy) + power;
	} else if (boid.y > this.bottom - d) {
	    var dy = this.bottom - d - boid.y;
	    vel.y = -Math.abs(boid.velocity.y * dy) - power;
	 }

	return vel;

};

KeepInsideBox.prototype.draw = function(ctx) {
    ctx.setTransform(1,0,0,1,0,0);

    ctx.beginPath();
    ctx.moveTo(this.right, this.top);
    ctx.lineTo(this.left, this.top);
    ctx.lineTo(this.left, this.bottom);
    ctx.lineTo(this.right, this.bottom);
    ctx.lineTo(this.right, this.top);
    ctx.closePath();

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
};

function KeepOutsideCircle(center, radius) {
    this.center = center;
    this.radius = radius;

    this.distance = 40;
    this.power = 0.07;
};

KeepOutsideCircle.prototype = new BehaviourRule();
KeepOutsideCircle.prototype.constuctor = KeepOutsideCircle;

KeepOutsideCircle.prototype.computeVelocity = function(boid, boids, predators) {
    var v = new Vector(0,0);
    
    var power = this.power;
    var d = this.distance;

    var diff = this.center.copy().diff(boid);
    var len = diff.length();
    
    if (len < d+this.radius) {
	v = diff.times(-power*(d + this.radius - len)/len).times(10);
    } else if (len < d+this.radius) {
	v = diff.times(-power*(d + this.radius - len)/len);
    }

    return v;

};

KeepOutsideCircle.prototype.draw = function(ctx) {
    ctx.setTransform(1,0,0,1,0,0);
    
    ctx.beginPath();
    ctx.moveTo(this.center.x, this.center.y);
    ctx.arc(this.center.x, this.center.y, this.radius, -Math.PI, Math.PI, true);
    ctx.closePath();
    
    ctx.fillStyle = "rgba(0,0,0, 0.8)";
    ctx.fill();
};

function StaticForce(force) {
    this.force = force;
}

StaticForce.prototype = new BehaviourRule();
StaticForce.prototype.constuctor = StaticForce;

StaticForce.prototype.computeVelocity = function(boid, boids, predators) {
	return this.force;
};


function AttractToPoint(point, timeout) {
    this.point = point;
    this.timeout = timeout;
    this._start_time = Date.now();
};

AttractToPoint.prototype = new BehaviourRule();
AttractToPoint.prototype.constuctor = AttractToPoint;

AttractToPoint.prototype.computeVelocity = function(boid, boids, predators) {
    if (this.timeout < 0 || Date.now() - this._start_time < this.timeout) {
	var v = this.point.copy().diff(boid);
	var len = v.length();
	return v.times(0.5/len).times(1 - len/1000);
    } else {
	return new Vector(0,0);
    }
};

AttractToPoint.prototype.draw = function(ctx) {
    if (this.timeout < 0 || Date.now() - this._start_time < this.timeout) {
	ctx.setTransform(1,0,0,1,0,0);
	
	ctx.beginPath();
	ctx.moveTo(this.point.x, this.point.y);
	ctx.arc(this.point.x, this.point.y, 50, -Math.PI, Math.PI, true);
	ctx.closePath();

	ctx.fillStyle = "rgba(0,0,255, 0.4)";
	ctx.fill();
	
	return true;
    } else {
	return false;
    }
};

function ChasePray() {
    this.speedup_distance = 30;
}

ChasePray.prototype = new BehaviourRule();
ChasePray.prototype.constuctor = ChasePray;

ChasePray.prototype.computeVelocity = function(boid, boids, predators) {

    var v = new Vector(0,0);
    var dd = -1;
    var index = -1;
    if (boids.length <= 0) return v;
    if (! (boid instanceof Predator) ) return v;

    
    for(var i=0; i < boids.length; ++i) {
	var diff = boids[i].copy().diff(boid);
	var _dd = diff.length();
	if (dd < 0) {
	    dd = _dd;
	    v = diff;
	    index = i;
	} else if (_dd < dd) {
	    dd = _dd;
	    v = diff;
	    index = i;
	}
    }

    var spd = this.speedup_distance;

    //If is close enough add have enough power or already chase a pray and not tired enough
    boid.in_chase = dd < spd && ( boid.chase_power > 18 || boid.in_chase) && (boid.chase_power > 1);


    if (boid.in_chase) {
//	console.log(v.toString());
	var xx = 1 + ( boid.chase_power*(spd - dd)/spd);
	if (boid.chase_power > 0) boid.chase_power -= 1;
	if (dd < 5) {
	    boids[index].kill();
	    boid.in_chase = false;
	}
	return v.times(0.5/dd).times(xx);
    } else {
	if (boid.chase_power < 20) boid.chase_power += 0.1;
	return v.times(0.5/dd);
    }
};


function RunAway() {}

RunAway.prototype = new BehaviourRule();
RunAway.prototype.constuctor = RunAway;

RunAway.prototype.computeVelocity = function(boid, boids, predators) {
    var v = new Vector(0,0);
    var dd = -1;
    
    for(var i=0; i < predators.length; ++i) {
	var diff = boid.copy().diff(predators[i]);
	var _dd = diff.length();
	if (dd < 0 && _dd < 100) {
	    dd = _dd;
	    v = diff;
	} else if (_dd < dd && _dd < 100) {
	    dd = _dd;
	    v = diff;
	}
    }
//    if (v.x != 0 && v.y != 0) {
//	console.log(boid.toString());
//    }
    
    return v.times(0.6/dd);
};
