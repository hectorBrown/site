let pend = new p5((sketch) => {
  var l1;
  var l2;

  var m1 = 1;
  var m2 = 1;

  var g = 10;

  var anchor;

  var state;
  var system;

  sketch.windowResized = () => {
    sketch.resizeCanvas(parent.clientWidth, parent.clientWidth);
    anchor = sketch.createVector(sketch.width / 2, sketch.height / 5);
    tracebuffer = [];
  };

  sketch.sigmoid = (scale, spread, x_0, x) => {
    return scale / (1 + Math.E ** (-spread * (x - x_0)));
  };

  sketch.get_sysvars = (state) => {
    output = [];
    //C
    output.push(
      -(m1 + m2) * g * l1 * sketch.sin(state[0]) -
        m2 * g * l2 * sketch.sin(state[0] + state[1]) +
        m2 * l1 * l2 * state[3] ** 2 * sketch.sin(state[1])
    );
    //A
    output.push((m1 + m2) * l1 ** 2);
    //B
    output.push(m2 * l1 * l2 * sketch.cos(state[1]));
    //Cp
    output.push(-m2 * g * l2 * sketch.sin(state[0] + state[1]));
    //Ap
    output.push(output[2]);
    //Bp
    output.push(m2 * l2 ** 2);

    //C A B Cp  Ap  Bp
    //0 1 2 3   4   5
    return output;
  };

  sketch.set_U0 = () => {
    T =
      (1 / 2) * m1 * l1 ** 2 * state[2] ** 2 +
      (1 / 2) *
        m2 *
        (l1 * state[2] + l2 * state[3] * sketch.cos(state[1])) ** 2 +
      (1 / 2) * m2 * (l2 * state[3] * sketch.sin(state[1])) ** 2;
    V =
      -m1 * g * l1 * sketch.cos(state[0]) -
      m2 *
        g *
        (l1 * sketch.cos(state[0]) + l2 * sketch.cos(state[0] + state[1]));
    U_0 = T + V;
  };

  sketch.setup = () => {
    parent = document.getElementById("pend-parent");
    canvas = sketch.createCanvas(parent.clientWidth, parent.clientWidth);

    canvas.parent("pend-parent");
    sketch.frameRate(60);

    l1 = 1 / 2;
    l2 = 1 / 4;
    l1_pix = (l1 / 1.5) * sketch.height;
    l2_pix = (l2 / 1.5) * sketch.height;
    anchor = sketch.createVector(sketch.width / 2, sketch.height / 5);

    //theta, phi, alpha, beta
    state_0 = [2, 0, 0, 0];
    state = state_0.slice();
    system = [
      (state) => {
        return state[2];
      },
      (state) => {
        return state[3];
      },
      (state) => {
        sysvars = sketch.get_sysvars(state);
        return (
          (sysvars[5] * sysvars[0] - sysvars[2] * sysvars[3]) /
          (sysvars[1] * sysvars[5] - sysvars[2] * sysvars[4])
        );
      },
      (state) => {
        sysvars = sketch.get_sysvars(state);
        return (
          (sysvars[1] * sysvars[3] - sysvars[4] * sysvars[0]) /
          (sysvars[1] * sysvars[5] - sysvars[2] * sysvars[4])
        );
      },
    ];

    tracebuffer = [];

    sketch.set_U0();

    {
      document.getElementById("m1_out").innerHTML = m1.toFixed(3);
      document.getElementById("m1").oninput = () => {
        m1 = 10 ** document.getElementById("m1").value;
        document.getElementById("m1_out").innerHTML = m1.toFixed(3);
        sketch.set_U0();
      };
      document.getElementById("m2_out").innerHTML = m2.toFixed(3);
      document.getElementById("m2").oninput = () => {
        m2 = 10 ** document.getElementById("m2").value;
        document.getElementById("m2_out").innerHTML = m2.toFixed(3);
        sketch.set_U0();
      };
      document.getElementById("l1_out").innerHTML = l1.toFixed(3);
      document.getElementById("l1").oninput = () => {
        l1 = Number(document.getElementById("l1").value);
        l1_pix = (l1 / 1.5) * sketch.height;
        document.getElementById("l1_out").innerHTML = l1.toFixed(3);
        sketch.set_U0();
      };
      document.getElementById("l2_out").innerHTML = l2.toFixed(3);
      document.getElementById("l2").oninput = () => {
        l2 = Number(document.getElementById("l2").value);
        l2_pix = (l2 / 1.5) * sketch.height;
        document.getElementById("l2_out").innerHTML = l2.toFixed(3);
        sketch.set_U0();
      };
      document.getElementById("theta_0_out").innerHTML = state_0[0].toFixed(3);
      document.getElementById("theta_0").oninput = () => {
        state_0[0] = Number(document.getElementById("theta_0").value);
        document.getElementById("theta_0_out").innerHTML =
          state_0[0].toFixed(3);
        state = state_0.slice();
        tracebuffer = [];
        sketch.set_U0();
      };
      document.getElementById("g_out").innerHTML = g.toFixed(3);
      document.getElementById("g").oninput = () => {
        g = 10 ** document.getElementById("g").value;
        document.getElementById("g_out").innerHTML = g.toFixed(3);
        sketch.set_U0();
      };
      document.getElementById("phi_0_out").innerHTML = state_0[1].toFixed(3);
      document.getElementById("phi_0").oninput = () => {
        state_0[1] = Number(document.getElementById("phi_0").value);
        document.getElementById("phi_0_out").innerHTML = state_0[1].toFixed(3);
        state = state_0.slice();
        tracebuffer = [];
        sketch.set_U0();
      };
      document.getElementById("trace").oninput = () => {
        tracebuffer = [];
      };
    }
  };

  sketch.draw = () => {
    sketch.background(52, 50, 48);

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

    sketch.strokeWeight(2);
    if (document.getElementById("trace").checked) {
      tracebuffer.unshift([bob2.x, bob2.y]);
      sketch.noFill();
      for (let i = 0; i <= Math.ceil(tracebuffer.length / 10); i++) {
        sketch.stroke(131, 165, 152, (255 * (50 - i)) / 50);
        sketch.beginShape();
        var list_start;
        if (i == 0) {
          list_start = 0;
        } else {
          list_start = i * 10 - 1;
        }
        tracebuffer.slice(list_start, (i + 1) * 10 + 2).forEach((element) => {
          sketch.curveVertex(element[0], element[1]);
        });
        sketch.endShape();
      }
      if (tracebuffer.length > 500) {
        tracebuffer.pop();
      }
    }
    sketch.fill(213, 196, 161);
    sketch.stroke(213, 196, 161);
    sketch.strokeWeight(3);
    sketch.line(anchor.x, anchor.y, bob1.x, bob1.y);
    sketch.line(bob1.x, bob1.y, bob2.x, bob2.y);
    sketch.circle(bob1.x, bob1.y, sketch.sigmoid(sketch.width / 10, 2, 1, m1));
    sketch.circle(bob2.x, bob2.y, sketch.sigmoid(sketch.width / 10, 2, 1, m2));
    sketch.stroke(102, 92, 84);
    sketch.fill(102, 92, 84);
    sketch.circle(anchor.x, anchor.y, 20);

    state = sketch.rk4(state, system, sketch.deltaTime / 1000);
    while (state[0] > sketch.PI) {
      state[0] -= 2 * sketch.PI;
    }
    while (state[0] < -sketch.PI) {
      state[0] += 2 * sketch.PI;
    }
    while (state[1] > sketch.PI) {
      state[1] -= 2 * sketch.PI;
    }
    while (state[1] < -sketch.PI) {
      state[1] += 2 * sketch.PI;
    }
    T =
      (1 / 2) * m1 * l1 ** 2 * state[2] ** 2 +
      (1 / 2) *
        m2 *
        (l1 * state[2] + l2 * state[3] * sketch.cos(state[1])) ** 2 +
      (1 / 2) * m2 * (l2 * state[3] * sketch.sin(state[1])) ** 2;
    V =
      -m1 * g * l1 * sketch.cos(state[0]) -
      m2 *
        g *
        (l1 * sketch.cos(state[0]) + l2 * sketch.cos(state[0] + state[1]));
    if (Math.abs(T + V) > 1.1 * Math.abs(U_0)) {
      state = state_0.slice();
      tracebuffer = [];
      console.log("Energy exceeded initial value, resetting to avoid crash.");
      sketch.set_U0();
    }

    //display vars
    document.getElementById("theta").innerHTML = state[0].toFixed(3);
    document.getElementById("phi").innerHTML = state[1].toFixed(3);
    document.getElementById("alpha").innerHTML = state[2].toFixed(3);
    document.getElementById("beta").innerHTML = state[3].toFixed(3);
    document.getElementById("T").innerHTML = T.toFixed(3);
    document.getElementById("V").innerHTML = V.toFixed(3);
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
