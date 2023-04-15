let pend = new p5((sketch) => {
  var l1;
  var l2;

  var m1 = 0.3;
  var m2 = 0.3;

  var g = 10;

  var anchor;

  var state;
  var system;

  sketch.windowResized = () => {
    sketch.resizeCanvas(parent.clientWidth, parent.clientWidth);
  };

  sketch.setup = () => {
    parent = document.getElementById("pend-parent");
    canvas = sketch.createCanvas(parent.clientWidth, parent.clientWidth);

    canvas.parent("pend-parent");
    sketch.frameRate(60);

    l1 = 1 / 2;
    l2 = 1 / 4;
    l1_pix = l1 * sketch.height;
    l2_pix = l2 * sketch.height;
    anchor = sketch.createVector(sketch.width / 2, 20);

    //theta, phi, alpha, beta
    state = [0, sketch.PI, 0, 0];
    system = [
      (state) => {
        return state[2];
      },
      (state) => {
        return state[3];
      },
      (state) => {
        return (
          (-(m1 + m2) * g * sketch.sin(state[0]) +
            m2 * l2 * sketch.sin(state[1]) * (state[2] + state[3]) ** 2) /
          (m1 * l1)
        );
      },
      (state) => {
        return (
          (m2 *
            l1 *
            l2 *
            sketch.sin(state[1]) *
            (2 * state[3] * (state[2] + state[3]) -
              (state[2] + state[3]) ** 2) -
            m2 * g * l2 * sketch.sin(state[0] + state[1])) /
            (l1 ** 2 + l2 ** 2 + 2 * l1 * l2 * sketch.cos(state[1])) -
          system[2](state)
        );
      },
    ];
  };

  sketch.draw = () => {
    sketch.background(52, 50, 48);
    sketch.stroke(213, 196, 161);
    sketch.fill(213, 196, 161);

    var theta = state[0];
    var phi = state[1];

    bob1 = sketch.createVector(
      anchor.x + l1_pix * sketch.sin(theta),
      anchor.y + l1_pix * sketch.cos(theta)
    );

    bob2 = sketch.createVector(
      bob1.x + l2_pix * sketch.sin(theta + phi),
      bob1.y + l2_pix * sketch.cos(theta + phi)
    );

    sketch.strokeWeight(3);
    sketch.line(anchor.x, anchor.y, bob1.x, bob1.y);
    sketch.line(bob1.x, bob1.y, bob2.x, bob2.y);
    sketch.circle(bob1.x, bob1.y, 30);
    sketch.circle(bob2.x, bob2.y, 30);
    sketch.stroke(102, 92, 84);
    sketch.fill(102, 92, 84);
    sketch.circle(anchor.x, anchor.y, 20);

    state = sketch.rk4(state, system, sketch.deltaTime / 1000);
    T =
      (1 / 2) * m1 * l1 ** 2 * state[2] ** 2 +
      (1 / 2) *
        m2 *
        (l1 ** 2 + l2 ** 2 + 2 * l1 * l2 * sketch.cos(state[1])) *
        (state[2] + state[3]) ** 2;
    V =
      -m1 * g * l1 * sketch.cos(state[0]) -
      m2 *
        g *
        (l1 * sketch.cos(state[0]) + l2 * sketch.cos(state[0] + state[1]));
    console.log("T: ", T);
    console.log("V: ", V);
    console.log("U: ", T + V);
    console.log(state);
  };

  sketch.rk4 = (state, system, dt) => {
    var k1 = [];
    var k2 = [];
    var k3 = [];
    var k4 = [];
    system.forEach((element) => {
      k1.push(element(state));
    });
    system.forEach((element) => {
      k2.push(element(sketch.progress(state, dt / 2, k1)));
    });
    system.forEach((element) => {
      k3.push(element(sketch.progress(state, dt / 2, k2)));
    });
    system.forEach((element) => {
      k4.push(element(sketch.progress(state, dt, k3)));
    });

    df = [];
    k1.forEach((element, index) => {
      df.push(
        (1 / 6) * (k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index])
      );
    });

    return sketch.progress(state, dt, df);
  };

  sketch.progress = (state, dt, k) => {
    var output = [];
    state.forEach((element, index) => {
      output.push(element + dt * k[index]);
    });
    return output;
  };
});
