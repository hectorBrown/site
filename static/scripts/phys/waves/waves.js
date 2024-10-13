// number of line segments to draw (will determine the maximum frequency of
// the fft)
resolution = 512;
// defined as an amplitude
wire = new Array(resolution).fill(0);
dft = new Array(resolution).fill(0);

function fft(input, samples) {
  if (samples == 1) {
    return [input, [0]];
  }
  var even = [];
  var odd = [];
  for (i = 0; i < samples; i += 1) {
    if (i % 2 == 0) {
      even.push(input[i]);
    } else {
      odd.push(input[i]);
    }
  }
  var even_fft = fft(even, samples / 2);
  var odd_fft = fft(odd, samples / 2);
  // real, imaginary
  var output = [new Array(samples), new Array(samples)];
  var re_factors = [];
  var im_factors = [];
  for (k = 0; k < samples; k += 1) {
    re_factors.push(Math.cos((2 * Math.PI * k) / samples));
    im_factors.push(Math.sin((2 * Math.PI * k) / samples));
  }
  for (i = 0; i < samples / 2; i += 1) {
    output[0][i] =
      even_fft[0][i] +
      re_factors[i] * odd_fft[0][i] -
      im_factors[i] * odd_fft[1][i];
    output[1][i] =
      even_fft[1][i] +
      im_factors[i] * odd_fft[0][i] +
      re_factors[i] * odd_fft[1][i];
    output[0][i + samples / 2] =
      even_fft[0][i] -
      re_factors[i] * odd_fft[0][i] -
      im_factors[i] * odd_fft[1][i];
    output[1][i + samples / 2] =
      even_fft[1][i] -
      im_factors[i] * odd_fft[0][i] +
      re_factors[i] * odd_fft[1][i];
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
    sketch.frameRate(120);
    sketch.strokeWeight(4);
    last_mouse = null;

    document.getElementById("reset_button").onclick = function () {
      wire = new Array(resolution).fill(0);
    };
  };

  sketch.draw = () => {
    sketch.background(52, 50, 48);
    sketch.stroke(213, 196, 161);
    seg_length = (0.8 * wave_canvas.width) / resolution;
    //draw each wire segment
    wire.forEach((segment, index, array) => {
      sketch.line(
        wave_canvas.width / 10 + seg_length * index,
        wave_canvas.height / 2 + segment,
        wave_canvas.width / 10 + seg_length * (index + 1),
        index + 1 < resolution
          ? wave_canvas.height / 2 + wire[index + 1]
          : wave_canvas.height / 2,
      );
    });
    sketch.fill(189, 174, 147);
    sketch.circle(wave_canvas.width / 10, wave_canvas.height / 2, 10);
    sketch.circle((wave_canvas.width / 10) * 9, wave_canvas.height / 2, 10);
  };

  sketch.mouseDragged = () => {
    // when the mouse is dragged, repeatedly assign the segment aligned with its
    // x coordinate to its y coordinate
    if (sketch.mouseButton == sketch.LEFT) {
      let seg = Math.round(
        (sketch.mouseX - wave_canvas.width / 10) / seg_length,
      );
      if (seg < resolution - 1 && seg > 0) {
        if (sketch.mouseY > 0 && sketch.mouseY < wave_canvas.height) {
          wire[seg] = sketch.mouseY - wave_canvas.height / 2;
        } else if (sketch.mouseY > wave_canvas.height) {
          wire[seg] = wave_canvas.height / 2;
        } else if (sketch.mouseY < 0) {
          wire[seg] = -wave_canvas.height / 2;
        }

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
                wire[i] =
                  ((sketch.mouseY - last_mouse[1]) * (i - last_seg)) /
                    (seg - last_seg) +
                  wire[last_seg];
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
    sketch.frameRate(120);
    last_mouse = null;
  };

  sketch.draw = () => {
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
    dft = fft(wire, resolution);
    norm_dft = new Array(resolution);
    for (i = 0; i < resolution; i++) {
      norm_dft[i] = Math.sqrt(dft[0][i] ** 2 + dft[1][i] ** 2);
    }
    scale =
      Math.max.apply(Math, norm_dft.slice(0, resolution / 4)) >
      fft_canvas.height - 50
        ? (fft_canvas.height - 50) /
          Math.max.apply(Math, norm_dft.slice(0, resolution / 4))
        : 1;
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
  };
});
