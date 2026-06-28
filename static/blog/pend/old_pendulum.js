const pendulum_canvas = document.getElementById("pendulum-panel");
const bSlider = document.getElementById("b_slider");
const f0Slider = document.getElementById("f_0_slider");
const omeSlider = document.getElementById("ome_slider");
const gSlider = document.getElementById("G_slider");
const theSlider = document.getElementById("the_init_slider");
const mSlider = document.getElementById("m_slider");
const lSlider = document.getElementById("l_slider");
bSlider.value = 0;
f0Slider.value = 0;
omeSlider.value = 0;
gSlider.value = 50;
theSlider.value = 25;
mSlider.value = 1;
l_slider.value = 50;
bSlider.addEventListener("change", function (event) {
  bSlider_Changed(event);
});
f0Slider.addEventListener("change", function (event) {
  f0Slider_Changed(event);
});
omeSlider.addEventListener("change", function (event) {
  omeSlider_Changed(event);
});
gSlider.addEventListener("change", function (event) {
  gSlider_Changed(event);
});
theSlider.addEventListener("change", function (event) {
  theSlider_Changed(event);
});
mSlider.addEventListener("change", function (event) {
  mSlider_Changed(event);
});
lSlider.addEventListener("change", function (event) {
  lSlider_Changed(event);
});
function bSlider_Changed(e) {
  b = bSlider.value / 1000;
}
function f0Slider_Changed(e) {
  F_0 = f0Slider.value / 500;
}
function omeSlider_Changed(e) {
  ome = omeSlider.value / 200;
}
function gSlider_Changed(e) {
  GRAVITY_SCALE = gSlider.value / 5000;
  G = 9.81 * GRAVITY_SCALE;
  F_g = new Vector(0, M * G);
}
function theSlider_Changed(e) {
  THE_INIT = theSlider.value * 0.01 * Math.PI;
  r = new Vector(l * Math.sin(THE_INIT) + O.x, l * Math.cos(THE_INIT) + O.y);
  prev_r = r;
  v = new Vector(0, 0);
}
function mSlider_Changed(e) {
  var oldM = M;
  M = mSlider.value;
  F_g = new Vector(0, M * G);
  v.mult(oldM / M);
  prev_r = r.minus(v);
}
function lSlider_Changed(e) {
  l = (CANVASHEIGHT / 100) * lSlider.value;
  r = new Vector(l * Math.sin(THE_INIT) + O.x, l * Math.cos(THE_INIT) + O.y);
  prev_r = r;
  v = new Vector(0, 0);
}

var CANVASWIDTH = pendulum_canvas.clientWidth;
var CANVASHEIGHT = pendulum_canvas.clientHeight;
pendulum_canvas.width = CANVASWIDTH;
pendulum_canvas.height = CANVASHEIGHT;
const pend_ctx = pendulum_canvas.getContext("2d");

var pend_clock = 0;
var pend_loopTime = 1;

//physical constants
var GRAVITY_SCALE = 0.01;
const TIME_WAIT = 0.01;
const F_DISP_SCALE = CANVASHEIGHT;
const V_DISP_SCALE = CANVASHEIGHT / 10;
const BOB_WIDTH = CANVASHEIGHT / 20;
var THE_INIT = Math.PI / 4;
var M = 1;
const M_O = 1;
var G = 9.81 * GRAVITY_SCALE;

//counter
var counter = 0;

//sys setup
var l = CANVASHEIGHT / 2;
var b = 0.0;
var O = new Vector(CANVASWIDTH / 2, CANVASHEIGHT / 4);
var r = new Vector(l * Math.sin(THE_INIT) + O.x, l * Math.cos(THE_INIT) + O.y);
var prev_r = r;
var v = new Vector(0, 0);
var O_F = new Vector(0, 0);
var O_v = new Vector(0, 0);
var F_g = new Vector(0, M * G);
var E_tot = (1 / 2) * M * v.mag() ** 2 + M * G * (CANVASHEIGHT - r.y);

var F_0 = 0.0;
var ome = 0.005;
var rel_r = 0;

//visuals
trail_list = [];

function pend_update_data() {
  const p_pos = document.getElementById("pos_data");
  const p_vel = document.getElementById("vel_data");
  const p_acc = document.getElementById("acc_data");
  const p_E = document.getElementById("E_data");
  const p_the = document.getElementById("the_data");
  p_pos.textContent =
    "{" +
    rel_r.x.toLocaleString(undefined, { minimumFractionDigits: 3 }) +
    ", " +
    -rel_r.y.toLocaleString(undefined, { minimumFractionDigits: 3 }) +
    "}";
  p_vel.textContent =
    "{" +
    v.x.toLocaleString(undefined, { minimumFractionDigits: 3 }) +
    ", " +
    -v.y.toLocaleString(undefined, { minimumFractionDigits: 3 }) +
    "}";
  p_acc.textContent =
    "{" +
    a.x.toLocaleString(undefined, { minimumFractionDigits: 3 }) +
    ", " +
    -a.y.toLocaleString(undefined, { minimumFractionDigits: 3 }) +
    "}";
  var E = (1 / 2) * M * Math.pow(v.mag(), 2);
  p_E.textContent = E.toLocaleString(undefined, { minimumFractionDigits: 3 });
  p_the.textContent = the.toLocaleString(undefined, {
    minimumFractionDigits: 3,
  });
}
function pend_update() {
  rel_r = r.minus(O);
  r = O.add(rel_r.unit().mult(l));
  v = r.minus(prev_r);
  prev_r = r;
  the = Math.atan2(rel_r.x, rel_r.y);
  T_mag = F_g.mag() * Math.cos(the) + v.minus(O_v).mag() ** 2 / l;
  F_T = rel_r.unit().mult(-T_mag);
  F_d = v.mult(-b / M);
  F_D = rel_r
    .perp()
    .unit()
    .mult(F_0 * Math.cos(ome * counter));
  F = F_g.add(F_T)
    .add(rel_r.unit().mult(O_F.dot(rel_r)))
    .add(F_d)
    .add(F_D);
  a = F.mult(1 / M);
  O_a = O_F.mult(1 / M_O);
  O_v = O_v.add(O_a);
  O = O.add(O_v);
  v = v.add(a);
  r = r.add(v).add(O_v);
  trail_list.push(r.copy());
  if (trail_list.length > 10) {
    trail_list = trail_list.slice(1);
  }
  pend_update_data();
  counter += 1;
}
function pend_draw() {
  pend_ctx.fillStyle = "black";
  pend_ctx.fillRect(0, 0, CANVASWIDTH, CANVASHEIGHT);

  pend_ctx.lineWidth = 3;
  pend_ctx.strokeStyle = "green";
  pend_ctx.beginPath();
  if (the > 0) {
    pend_ctx.arc(O.x, O.y, 0.2 * l, Math.PI / 2 - the, Math.PI / 2);
  } else {
    pend_ctx.arc(O.x, O.y, 0.2 * l, Math.PI / 2, Math.PI / 2 - the);
  }
  pend_ctx.stroke();

  pend_ctx.strokeStyle = "white";
  pend_ctx.beginPath();
  pend_ctx.moveTo(O.x, O.y);
  pend_ctx.lineTo(r.x, r.y);
  pend_ctx.stroke();

  pend_ctx.strokeStyle = "blue";
  pend_ctx.beginPath();
  pend_ctx.moveTo(r.x, r.y);
  pend_ctx.lineTo(r.x + F_DISP_SCALE * F.x, r.y + F_DISP_SCALE * F.y);
  pend_ctx.stroke();

  pend_ctx.strokeStyle = "red";
  pend_ctx.beginPath();
  pend_ctx.moveTo(r.x, r.y);
  pend_ctx.lineTo(r.x + V_DISP_SCALE * v.x, r.y + V_DISP_SCALE * v.y);
  pend_ctx.stroke();

  i = 2;
  pend_ctx.fillStyle = "white";
  for (circle of trail_list) {
    pend_ctx.beginPath();
    size = (i * 1) / 9;
    pend_ctx.ellipse(
      circle.x,
      circle.y,
      (BOB_WIDTH / 2) * size,
      (BOB_WIDTH / 2) * size,
      0,
      0,
      2 * Math.PI,
    );
    pend_ctx.fill();
    i += 0.75;
  }
}
function pendLoop() {
  if (pend_clock == pend_loopTime) {
    pend_update();
    pend_draw();
    pend_clock = 0;
  }
  pend_clock++;
  requestAnimationFrame(pendLoop);
}
requestAnimationFrame(pendLoop);
