var $_id = function (id_name) { "use strict"; return document.getElementById(id_name); };
var $_class = function (class_name) { "use strict"; return document.getElementsByClassName(class_name); };

function mousecoors(e) {
    "use strict";
    return {x : e.pageX, y : e.pageY};
}

function floatCorrect(num) { "use strict"; return Math.round(num * 100000000000000) / 100000000000000; }

function rand(min, max) {
    "use strict";
    return parseInt(Math.random() * (max - min + 1), 10) + min;
}

function randPastelColor() {
    "use strict";
    var h = rand(1, 360), // color hue between 1 and 360
        s = rand(30, 100), // saturation 30-100%
        l = rand(30, 70); // lightness 30-70%
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

function toFixed(x) {
    "use strict";

    var e;
    if (Math.abs(x) < 1.0) {
        e = parseInt(x.toString().split('e-')[1], 10);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + new Array(e).join('0') + x.toString().substring(2);
        }
    } else {
        e = parseInt(x.toString().split('+')[1], 10);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += new Array(e + 1).join('0');
        }
    }
    return x;
}

var c = $_id("c");
var cc = c.getContext("2d");

var ratio = (typeof (window.devicePixelRatio) !== "undefined" && window.devicePixelRatio) // screen pixel ratio
            || 1;

var props = {
    cw : null,
    ch : null,
    axis : {spacing : 50,
            scale : 2,
            center : {x : null, y : null}}

};

var graph = {

    expr: [{val: null, color: randPastelColor()}], // init expression settings

    addExpr: function () {
        "use strict";

        var newNode = $_id("exprs").lastChild.previousSibling.outerHTML, // clone node
            afterThis = $_id("add-expr"),
            newColor = randPastelColor();

        afterThis.insertAdjacentHTML("afterend", newNode);

        this.expr.push({val: null, color: $_id("add-expr").style.borderColor});

        $_class("expr-input")[0].style.borderColor = this.expr[this.expr.length - 1].color;
        $_id("add-expr").style.cssText = "border-color: " + newColor + "; color: " + newColor + ";";

    },

    plot: function () {
        "use strict";

        var ymax = props.axis.center.y,
            ymin = ymax - props.ch,

            xmin = -props.axis.center.x,
            xmax = xmin + props.cw,
            x,
            y,
            subs,
            i;

        cc.translate(props.axis.center.x, props.axis.center.y); // souřadnice [0, 0] canvasu = nulové souř. os x a y

        cc.lineWidth = 2;

        for (i = 0; i < this.expr.length; i += 1) {

            if (this.expr[i].val !== null && this.expr[i].val !== "") {

                x = xmin;
                do {
                    cc.beginPath();
                    cc.strokeStyle = this.expr[i].color;

                    subs = this.expr[i].val.replace(/x/g, '(' + toFixed(x) + ')');
                    y = -parsexpr.evaluate(subs); // inverse y value

                    if (y * props.axis.spacing / props.axis.scale >= ymin || y * props.axis.spacing / props.axis.scale <= ymax) {

                        cc.moveTo(x * props.axis.spacing / props.axis.scale, y * props.axis.spacing / props.axis.scale);

                        x += props.axis.scale / 5;

                        subs = this.expr[i].val.replace(/x/g, '(' + toFixed(x) + ')');
                        y = -parsexpr.evaluate(subs); // inverse y value

                        cc.lineTo(x * props.axis.spacing / props.axis.scale, y * props.axis.spacing / props.axis.scale);
                        cc.stroke();
                    } else {
                        x += props.axis.scale / 5;
                    }

                } while (x <= xmax);
            }
        }

    }

};

var grid = {

    showCoordinates : function (event) {
        "use strict";

        var mx = event.pageX,
            my = event.pageY,
            coorX = (mx - Math.floor(props.axis.center.x)) / props.axis.spacing * props.axis.scale,
            coorY = -(my - Math.floor(props.axis.center.y)) / props.axis.spacing * props.axis.scale,
            prec;

        try {
            prec = props.axis.scale.toString().split('.')[1].length;
        } catch (err) {
            prec = 2;
        }

        $_id("coorX").innerHTML = coorX.toPrecision(prec);
        $_id("coorY").innerHTML = coorY.toPrecision(prec);

    },

    shiftCoordinates : function (event, oldCoor) {
        "use strict";

        var newCoor = mousecoors(event);

        props.axis.center.x = props.axis.center.x + (newCoor.x - oldCoor.x);
        props.axis.center.y = props.axis.center.y + (newCoor.y - oldCoor.y);
        oldCoor.x = newCoor.x;
        oldCoor.y = newCoor.y;

        grid.render();
        graph.plot();

    },

    scalingCoordinates : function (event) {
        "use strict";

        var delta = event.deltaY,
            n;

        if (delta > 0) {
            if (props.axis.spacing < 65) {
                props.axis.spacing += 3;
            } else {
                props.axis.spacing = 50;

                n = props.axis.scale.toString();
                if (n.indexOf(5) !== -1) { props.axis.scale *= 2 / 5; }
                if (n.indexOf(2) !== -1) { props.axis.scale /= 2; }
                if (n.indexOf(1) !== -1) { props.axis.scale /= 2; }
            }
        } else if (delta < 0) {
            if (props.axis.spacing > 35) {
                props.axis.spacing -= 3;
            } else {
                props.axis.spacing = 50;

                n = props.axis.scale.toString();
                if (n.indexOf(5) !== -1) { props.axis.scale *= 2; }
                if (n.indexOf(2) !== -1) { props.axis.scale /= 2 / 5; }
                if (n.indexOf(1) !== -1) { props.axis.scale *= 2; }
            }
        }

        grid.render();
        graph.plot();

    },

    drawCoordinates : function () {
        "use strict";

        var x,
            y,
            tx,
            ty,
            numx,
            numy;

        cc.strokeStyle = "#d7d7d7";
        cc.lineWidth = 1;

        // horizontal lines
        for (x = props.axis.center.y % props.axis.spacing; x < props.ch; x += props.axis.spacing) {
            cc.moveTo(0, x);
            cc.lineTo(props.cw, x);
        }

        // vertical lines
        for (y = props.axis.center.x % props.axis.spacing; y < props.cw; y += props.axis.spacing) {
            cc.moveTo(y, 0);
            cc.lineTo(y, props.cw);
        }

        cc.stroke();
        cc.save();

        cc.beginPath();
        cc.strokeStyle = "#404040";
        cc.lineWidth = 2;

        cc.moveTo(0, props.axis.center.y);
        cc.lineTo(props.cw, props.axis.center.y);

        cc.moveTo(props.axis.center.x, 0);
        cc.lineTo(props.axis.center.x, props.ch);

        cc.stroke();
        cc.restore();
        cc.beginPath();
        cc.save();

        cc.font = ".4em Helvetica, Arial, sans-serif";
        cc.fillStyle = "#404040";

        // horizontal x line number annotation
        for (numx = -Math.floor(props.axis.center.x / props.axis.spacing) * props.axis.scale,
                tx = props.axis.center.x % props.axis.spacing;
                tx < props.cw;
                numx += props.axis.scale,
                tx += props.axis.spacing) {
            cc.fillText(floatCorrect(numx), tx + 2.5, props.axis.center.y + 10);
        }

        // vertical y line number annotation
        for (numy = Math.floor(props.axis.center.y / props.axis.spacing) * props.axis.scale,
                ty = props.axis.center.y % props.axis.spacing;
                ty < props.ch;
                numy -= props.axis.scale,
                ty += props.axis.spacing) {
            cc.fillText(floatCorrect(numy), props.axis.center.x + 2.5, ty + 10);
        }

    },

    render: function () {
        "use strict";

        cc.clear();

        c.setAttribute("width", props.cw * ratio);
        c.setAttribute("height", props.ch * ratio);

        c.style.width = props.cw + "px";
        c.style.height = props.ch + "px";

        cc.scale(ratio, ratio);

        this.drawCoordinates();

    },


    setup: function () {
        "use strict";

        props.cw = window.innerWidth;
        props.ch = window.innerHeight;

        props.axis.center.x = props.cw / 2;
        props.axis.center.y = props.ch / 2;

        this.render();
    }

};


CanvasRenderingContext2D.prototype.clear = CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
    "use strict";
    if (preserveTransform) {
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
        this.restore();
    }
};

window.onload = function () {
    "use strict";

    var initColor = randPastelColor();

    $_class("expr-input")[0].style.borderColor = graph.expr[0].color;
    $_id("add-expr").style.cssText = "border-color: " + initColor + "; color: " + initColor + ";";

    grid.setup();
    graph.plot();
};

window.onresize = function () {
    "use strict";

    props.cw = window.innerWidth;
    props.ch = window.innerHeight;

    grid.render();
    graph.plot();

};


var mousedown = false,
    oldCoor;

c.onmousedown = function (event) { "use strict"; mousedown = true; oldCoor = mousecoors(event); };
c.onmouseup = function () { "use strict"; mousedown = false; };

c.onmousemove = function (event) {
    "use strict";
    grid.showCoordinates(event);
    if (mousedown) { grid.shiftCoordinates(event, oldCoor); }
};

c.onwheel = grid.scalingCoordinates;


function submit(e, input) {
    "use strict";

    var code = e.keyCode || e.which,
        node,
        i;
    if (code === 13) { // enter

        node = Array.prototype.slice.call($_id('exprs').children);
        i = node.reverse().indexOf(input);

        graph.expr[i].val = input.value.replace(/(\d+[\.,]?\d*)(x)/g, "$1*$2").replace(/,/g, ".");
        grid.render();
        graph.plot();

    }
}