// number of line segments to draw (will determine the maximum frequency of
// the fft)
resolution = 512;
dispersion = new Array(resolution).fill(1);
// defined as an amplitude
dft = new Array(resolution).fill(math.complex(0, 0));
wire = new Array(resolution);
for (i = 0; i < resolution; i++) {
  wire[i] = math.complex(0, 0);
}

update_fft = false;
first_run = true;

// this actually does the dft
function fft(input, inverse = false) {
  // if we have a single point, return it
  var samples = input.length;
  if (samples == 1) {
    return input;
  }

  //collect even and odd indexed terms
  var even = [];
  var odd = [];
  for (var i = 0; i < samples; i += 1) {
    if (i % 2 == 0) {
      even.push(input[i]);
    } else {
      odd.push(input[i]);
    }
  }
  //take ffts of both of these
  var even_fft = fft(even, inverse);
  var odd_fft = fft(odd, inverse);

  var output = new Array(samples);

  //find imaginary factors to the nth root of unity, where n=samples
  var angle = ((2 * math.PI) / samples) * (inverse ? 1 : -1);
  var step = math.complex(math.cos(angle), math.sin(angle));
  var twiddle = math.complex(1, 0);
  //combine the sub-ffts (with twiddle factors) to produce the dft
  // these calculations are just simple complex multiplication
  for (var i = 0; i < samples / 2; i += 1) {
    output[i] = math.add(even_fft[i], math.multiply(twiddle, odd_fft[i]));
    output[i + samples / 2] = math.subtract(
      even_fft[i],
      math.multiply(twiddle, odd_fft[i]),
    );
    if (inverse) {
      output[i] = math.divide(output[i], 2);
      output[i + samples / 2] = math.divide(output[i + samples / 2], 2);
    }
    twiddle = math.multiply(twiddle, step);
  }
  return output;
}

let waves = new p5((sketch) => {
  sketch.windowResized = () => {
    sketch.resizeCanvas(parent.clientWidth, parent.clientWidth / 2);
  };

  sketch.setup = () => {
    parent = document.getElementById("waves-parent");
    wave_canvas = sketch.createCanvas(
      parent.clientWidth,
      parent.clientWidth / 2,
    );

    wave_canvas.parent("waves-parent");
    sketch.frameRate(60);
    sketch.strokeWeight(4);
    last_mouse = null;
    motion = false;

    document.getElementById("reset_button").onclick = function () {
      wire = new Array(resolution);
      for (i = 0; i < resolution; i++) {
        wire[i] = math.complex(0, 0);
      }
      first_run = true;
    };
    // document.getElementById("play_button").onclick = function () {
    //   play_button = document.getElementById("play_button");
    //   if (play_button.innerHTML == "Play") {
    //     motion = true;
    //     play_button.innerHTML = "Pause";
    //   } else {
    //     motion = false;
    //     play_button.innerHTML = "Play";
    //   }
    // };
  };

  sketch.draw = () => {
    sketch.background(52, 50, 48);
    sketch.stroke(213, 196, 161);
    seg_length = (0.8 * wave_canvas.width) / resolution;
    //draw each wire segment
    re_wire = [];
    wire.forEach((segment, index, _) => {
      re_wire[index] = segment.re;
    });
    re_wire.forEach((segment, index, _) => {
      sketch.line(
        wave_canvas.width / 10 + seg_length * index,
        wave_canvas.height / 2 + segment,
        wave_canvas.width / 10 + seg_length * (index + 1),
        index + 1 < resolution
          ? wave_canvas.height / 2 + re_wire[index + 1]
          : wave_canvas.height / 2,
      );
    });
    if (motion) {
      // this is cooked
      init_fft = fft(wire);
      output_fft = [];
      for (var i = 0; i < init_fft.length; i++) {
        output_fft.push(
          math.multiply(init_fft[i], math.complex((r = 1), (phi = 0.1))),
        );
      }
      wire = fft(output_fft, (inverse = true));
    }
    sketch.fill(189, 174, 147);
    sketch.circle(wave_canvas.width / 10, wave_canvas.height / 2, 10);
    sketch.circle((wave_canvas.width / 10) * 9, wave_canvas.height / 2, 10);
  };

  sketch.mouseDragged = () => {
    // when the mouse is dragged, repeatedly assign the segment aligned with its
    // x coordinate to its y coordinate
    update_fft = true;
    if (sketch.mouseButton == sketch.LEFT) {
      let seg = Math.round(
        (sketch.mouseX - wave_canvas.width / 10) / seg_length,
      );
      if (seg < resolution && seg > 0) {
        // scale up while maintaining phase -- honestly i can't justify this it just feels right atm
        var amplitude;
        if (sketch.mouseY > 0 && sketch.mouseY < wave_canvas.height) {
          amplitude = sketch.mouseY - wave_canvas.height / 2;
        } else if (sketch.mouseY > wave_canvas.height) {
          amplitude = wave_canvas.height / 2;
        } else if (sketch.mouseY < 0) {
          amplitude = -wave_canvas.height / 2;
        }
        wire[seg] = math.complex(amplitude, 0);

        // this routine only takes a sample of the mouse's position every so often
        // if we find that the mouse has not been released since the last time it
        // was called, we interpolate a straight line between the last position
        // and the new one and iteratively assign each line segment in that range
        // a new value based on this linear approximation to the mouse's movement
        if (last_mouse != null) {
          if (Math.abs(last_seg - seg) > 1) {
            for (
              i = last_seg < seg ? last_seg + 1 : seg + 1;
              i < (last_seg < seg ? seg : last_seg);
              i++
            ) {
              if (i != 0 && i != resolution - 1) {
                wire[i] = math.complex(
                  ((sketch.mouseY - last_mouse[1]) * (i - last_seg)) /
                    (seg - last_seg) +
                    wire[last_seg].re,
                  0,
                );
              }
            }
          }
        }
        last_seg = seg;
        last_mouse = [sketch.mouseX, sketch.mouseY];
      }
    }
  };

  sketch.mouseReleased = () => {
    if (sketch.mouseButton == sketch.LEFT) {
      last_mouse = null;
      update_fft = false;
    }
  };
});

let ft = new p5((sketch) => {
  sketch.windowResized = () => {
    sketch.resizeCanvas(parent.clientWidth, parent.clientWidth / 4);
  };

  sketch.setup = () => {
    parent = document.getElementById("fft-parent");
    fft_canvas = sketch.createCanvas(
      parent.clientWidth,
      parent.clientWidth / 4,
    );

    fft_canvas.parent("fft-parent");
    sketch.frameRate(60);
    last_mouse = null;
  };

  sketch.draw = () => {
    first_run = true;
    sketch.background(52, 50, 48);
    sketch.fill(189, 174, 147);
    sketch.strokeWeight(3);
    sketch.stroke(74, 68, 58);
    sketch.line(
      fft_canvas.width / 10,
      fft_canvas.height,
      (fft_canvas.width / 10) * 9,
      fft_canvas.height,
    );
    var seg_length = ((0.8 * fft_canvas.width) / (resolution - 1)) * 4;
    if (update_fft || first_run) {
      dft = fft(wire);
      norm_dft = new Array(resolution);
      for (i = 0; i < resolution; i++) {
        norm_dft[i] = Math.sqrt(dft[i].re ** 2 + dft[i].im ** 2);
      }
      scale =
        Math.max.apply(Math, norm_dft.slice(0, resolution / 4)) >
        fft_canvas.height - 50
          ? (fft_canvas.height - 50) /
            Math.max.apply(Math, norm_dft.slice(0, resolution / 4))
          : 1;
    }
    //draw each dft segment
    sketch.stroke(213, 196, 161);
    sketch.strokeWeight(4);
    norm_dft.slice(0, resolution / 4).forEach((segment, index, array) => {
      sketch.line(
        fft_canvas.width / 10 + seg_length * index,
        fft_canvas.height - segment * scale,
        fft_canvas.width / 10 + seg_length * (index + 1),
        fft_canvas.height - norm_dft[index + 1] * scale,
      );
    });
    first_run = false;
  };
});
