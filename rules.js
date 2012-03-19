
function BehaviourRule() {

}

BehaviourRule.DefaultBoidsRules = function() {
    return [ new SteerToCenter(),
	     new KeepDistance(),
	     new KeepSpeed() ];
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
    
    for(var i=0; i < boids.length; ++i) {
	if (boids[i].id != boid.id) {
	    var v_diff = boid.copy().diff(boids[i]);
	    if (v_diff.length() < 30) {
		v.diff(v_diff);
	    }
	}
    }
    return v.times(-1/50);
};


function KeepSpeed() {

}

KeepSpeed.prototype = new BehaviourRule();
KeepSpeed.prototype.constuctor = KeepSpeed;

KeepSpeed.prototype.computeVelocity = function(boid, boids, predators) {
    var v = new Vector(0,0);
    
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

    this.distance = 50;
    this.power = 0.05;
};

KeepInsideBox.prototype = new BehaviourRule();
KeepInsideBox.prototype.constuctor = KeepInsideBox;

KeepInsideBox.prototype.computeVelocity = function(boid, boids, predators) {
    	var vel = new Vector(0,0);
	var power = this.power;
	var d = this.distance;
 	if (boid.x < this.left + d) {
	    vel.x = (this.left + d - boid.x)*power;
	} else if (boid.x > this.right - d) {
	    vel.x = (this.right - d - boid.x)*power;
	}

 	if (boid.y < this.top + d) {
	    vel.y = (this.top + d - boid.y)*power;
	} else if (boid.y > this.bottom - d) {
	    vel.y = (this.bottom - d - boid.y)*power;
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

