

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
    this.rules = [];
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

    var v = new Vector(0,0);
    for(var i=0; i<this.rules.length; ++i) {
	var v1 = this.rules[i].computeVelocity(this, boids, []);
	v.add(v1);
    }
    this.velocity.add(v);
    var len = this.velocity.length();
    
    //Limit the speed
    var speed_limit = 3;
    if (len > speed_limit) this.velocity.times(speed_limit/len);

    this.add(this.velocity);
}

Boid.prototype.toString = function() {
    return this.id + " (" + this.x + ", " + this.y +")";
}

