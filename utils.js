var THEME = 'fish';

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
