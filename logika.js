
"use strict";
let position = { x: 0, y: 0 };
let cnvs = document.getElementById('canvas1');
let fctx = cnvs.getContext('2d');   /* final drawing canvas */
let width = cnvs.width;
let height = cnvs.height;
let bcnvs = document.createElement('canvas');  /* background canvas */
bcnvs.width = width;
bcnvs.height = height;
let bctx = bcnvs.getContext('2d');
let hinge = document.getElementById('hinge');
hinge.scale = 0.4;
let spring = document.getElementById('spring');
spring.scale = .25;
let mass = document.getElementById('mass');
mass.scale = 0.25;
let minX = -3.;
let maxX = 3.;
let minY = -5;
let maxY = 1;
function Px(x) {
    return width * (x - minX) / (maxX - minX);
}
function Py(y) {
    return height * (maxY - y) / (maxY - minY);
}
function iPx(x) { return ((x * (maxX - minX) / width) + minX); }
function iPy(y) { return (maxY - (y * (maxY - minY) / height)); }
let canvas2 = document.getElementById('canvas2');
let plt1 = new Plot(canvas2);
plt1.ylimits = [-3, 1];
plt1.xlimits = [0, 100];
plt1.grid = 'on';
plt1.xticks.noDivs = 5;
plt1.yticks.noDivs = 4;
plt1.margins.right = 20;
plt1.xticks.precision = 0;
plt1.yticks.precision = 0;
plt1.xlabel = 'time [s]';
plt1.ylabel = 'Position [m]';
plt1.legend.location = [430, 20];
let xcurve = plt1.addCurveFromPoints();
let ycurve = plt1.addCurveFromPoints();
xcurve.name = 'x';
ycurve.name = 'y';
plt1.legend.visible = true;
plt1.init();
let canvas3 = document.getElementById('canvas3');
let plt2 = new Plot(canvas3);
plt2.ylimits = [-5, 5];
plt2.xlimits = [0, 100];
plt2.grid = 'on';
plt2.xticks.noDivs = 5;
plt2.yticks.noDivs = 4;
plt2.margins.right = 20;
plt2.xticks.precision = 0;
plt2.yticks.precision = 0;
plt2.xlabel = 'time [s]';
plt2.ylabel = 'Mechanical Energy [j]';
plt2.legend.location = [400, 20];
let ecurve = plt2.addCurveFromPoints();
let kecurve = plt2.addCurveFromPoints();
let pecurve = plt2.addCurveFromPoints();
ecurve.name = 'total';
kecurve.name = 'kinetic';
pecurve.name = 'potential';
plt2.legend.visible = true;
let xc, yc, xo, yo; // x and y coordinates ;
let lo, vxo, vyo, vx, vy, dt, g, m, k;
let time, pltTime;
let running = false;
function getNum(id) { /* gets the number from the GUI using the id */
    return eval(document.getElementById(id).value);
}
function init() {
    plt1.reset();
    plt2.reset();
    time = 0.;
    pltTime = 0.;
    plt1.xlimits = [0, 100];
    xo = getNum('xo');
    yo = getNum('yo');
    vxo = getNum('vxo');
    vyo = getNum('vyo');
    lo = getNum('lo');
    m = getNum('m');
    k = getNum('k');
    g = getNum('g');
    dt = getNum('dt');
    xc = xo;
    yc = yo;
    vx = vxo;
    vy = vyo;
    bctx.setTransform(1., 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, width, height);
    bctx.translate(Px(0), Py(0));
    bctx.scale(hinge.scale, hinge.scale);
    bctx.drawImage(hinge, -hinge.width * 0.5, -hinge.height * 0.5);
    bctx.setTransform(1., 0, 0, 1, 0, 0);
    draw();
}
function xAccel() {
    let l = Math.sqrt(xc * xc + yc * yc);
    let dl = l - lo;
    return -(k * xc * dl / (m * l));
}
function yAccel() {
    let l = Math.sqrt(xc * xc + yc * yc);
    let dl = l - lo;
    return -(k * yc * dl / (m * l) + g);
}
function kenergy() {
    return (0.5 * m * (vx * vx + vy * vy));
}
function penergy() {
    let l = Math.sqrt(xc * xc + yc * yc);
    let dl = l - lo;
    return (0.5 * k * dl * dl + m * g * (yc));
}
function energy() {
    return (kenergy() + penergy());
}
function marchTime() {
    time += dt;
    pltTime += dt;
    let ax = xAccel();
    let ay = yAccel();
    xc += vx * dt + 0.5 * dt * dt * ax;
    yc += vy * dt + 0.5 * dt * dt * ay;
    vx += ax * dt + .5 * dt * (xAccel() - ax);
    vy += ay * dt + .5 * dt * (yAccel() - ay);
}
function draw() {
    if (pltTime > 100) {
        pltTime -= 100;
        plt1.xlimits = [plt1.xlimits[0] + 100, plt1.xlimits[1] + 100];
        plt2.xlimits = [plt2.xlimits[0] + 100, plt2.xlimits[1] + 100];
        plt1.reset();
        plt2.reset();
    }
    xcurve.draw(time, xc);
    ycurve.draw(time, yc);
    ecurve.draw(time, energy());
    kecurve.draw(time, kenergy());
    pecurve.draw(time, penergy());
    fctx.setTransform(1., 0, 0, 1, 0, 0);
    fctx.clearRect(0, 0, width, height);
    fctx.drawImage(bcnvs, 0, 0);
    fctx.setTransform(1., 0, 0, 1, 0, 0);
    fctx.translate(Px(xc), Py(yc));
    fctx.scale(mass.scale, mass.scale);
    fctx.drawImage(mass, -mass.width * 0.5, -mass.height * 0.5);
    let theta = Math.PI * (1.5) - Math.atan2(yc, xc);
    let x = Px(xc) - Px(0);
    let y = Py(yc) - Py(0);
    let length = Math.sqrt(x * x + y * y);
    fctx.setTransform(1., 0, 0, 1, 0, 0);
    fctx.translate(Px(0), Py(0));
    fctx.rotate(theta);
    fctx.scale(spring.scale, (length / spring.height));
    fctx.drawImage(spring, -spring.width / 2., 0);
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.font = 'italic 20px times';
    if (running) {
        fctx.fillText('Running...', 30, 30);
    } else {
        fctx.fillText('Paused!', 30, 30);
    }
    fctx.fillText('Solution time = ' + time.toFixed(3), 200, 30);
    fctx.font = '16px times';
    fctx.fillText('x = ' + xc.toFixed(3), 30, 80);
    fctx.fillText('y = ' + yc.toFixed(3), 30, 100);
}
cnvs.addEventListener('click', myMouseClick, false);
cnvs.addEventListener('mousemove', myMouseMove, false);
function myMouseClick(e) {
    clickX = (e.clientX + document.documentElement.scrollLeft - cnvs.offsetLeft);
    clickX = e.offsetX;
    clickY = (e.clientY + document.documentElement.scrollTop - cnvs.offsetTop);
    clickY = e.offsetY;
    xo = iPx(clickX);
    yo = iPy(clickY);
    document.getElementById('xo').value = xo;
    document.getElementById('yo').value = yo;
    init();
}
function myMouseMove(e) {
    if (e.buttons < 1) return;
    myMouseClick(e);
}
function run() {
    if (running) {
        for (let i = 0; i < getNum('skip'); i++) {
            marchTime();
        }
    }
    draw();
    setTimeout(run, getNum('wait'));
}
init();
run();