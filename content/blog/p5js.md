---
title: "Making animated site backgrounds with p5js"
date: 2023-03-29T15:25:24+01:00
draft: false
---

While designing this site, I thought it would look cool to create an animated
background for the [homepage](/), and maybe some other pages (pending). I always
felt that [Processing](https://processing.org/) was a nice way to
write graphics, and was pretty excited to find a JavaScript library,
[p5js](https://p5js.org/), that seemed to function in practically the same way.

<!--more-->

{{< toc >}}

## Starting with p5js

p5js uses, similarly to Processing, just 2 routines: {{< highlight js
"hl_inline=true" >}}setup(){{< /highlight >}}, which is run once at the very
beginning of execution; and {{<highlight js "hl_inline=true" >}}draw(){{<
/highlight >}}, which runs continuously and is responsible for updating the
graphics. By default,
{{<highlight js "hl_inline=true" >}}draw(){{< /highlight >}} runs as often as
possible, but a frame rate can be set.

For example, this program:

{{< highlight js "linenos=inline" >}}
function setup() {
//create canvas
createCanvas();

//set constant framerate -- this is important for consistent speed across devices
frameRate(30);

//setup the shape object we will draw
shape = {
pos: createVector(0, 0),
dir: createVector(5, 4),
size: width / 10,
};
}

function draw() {
//setup colours
background(102, 92, 84);
stroke(169, 172, 38);
fill(169, 172, 38);

//draw square
square(shape.pos.x, shape.pos.y, shape.size);

//move square
shape.pos.add(shape.dir);

//bounce off of walls
if (shape.pos.x < 0 || shape.pos.x + shape.size > width) {
shape.dir.x _= -1;
}
if (shape.pos.y < 0 || shape.pos.y + shape.size > height) {
shape.dir.y_= -1;
}
}

{{< / highlight >}}

renders to:

<div id="eg-1-parent" style="width: 100%; height: auto;"></div>
<script src="https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js"></script> <!--
load p5.js from CDN-->
<script src="/scripts/blog/p5js/eg-1.js"></script>

_I have omitted some of the lines that deal with canvas sizing and placement,
but I'll come on to that in a second. For
the sake of interest, [this](/scripts/blog/p5js/eg-1.js) is the full script._

So that's awesome, we can now animate whatever relatively painlessly. I'll omit
the details on [how](/blog/boids) I created the boids now, and move on to:

## But how do I make it a background

The first thing you'll notice if you try to create a canvas on a page that
already has content is that it'll just drop it at the end. We obviously want to
be able to position the animation as a normal HTML element:

<ol>
    <li><p>Create a containing
    {{< highlight html "hl_inline=true" >}}<div>{{< /highlight >}}
    at the very top of your page, and make its position
    fixed:</p>
    {{< highlight html >}}
    …
    </head>
    <body>
        <div id="background" style="position: fixed; width: 100%; height: 100%;"></div>
        <div class="content">
    …
    {{< /highlight >}}
    <p>You also want to make the canvas position fixed:</p>
    {{< highlight css >}}
    canvas {
        position: fixed;
    }
    {{< /highlight >}}
    </li>
    <li><p>Identify this
    {{< highlight html "hl_inline=true" >}}<div>{{< /highlight >}}
    as the parent element of your canvas in the sketch code, making sure to
    specify that the width and height of your canvas should be the same as that of
    the window:</p>
    {{< highlight js >}}
    function setup() {
      canvas = createCanvas(windowWidth, windowHeight);
      canvas.parent("background");
      …
    }
    {{< /highlight >}}
    </li>
    <li><p>Finally, we need to make sure the background is actually in the
background, this can be done by setting the z-index of the canvas:
    {{< highlight js >}}
    function setup() {
      …
      canvas.style("z-index", "-1");
      …
    }
    {{< /highlight >}}
    <p>Of course it's important to make sure that all the other elements on
    your page have z-indeces > -1.
</ol>

## Getting that sweet blur effect

The last thing you might notice on my homepage is the blurring effect on the
central panel. This is, unbelievably, very easy to achieve. There is a CSS
opacity property, however this doesn't work very well (or at all) with the
blurring, so instead we can just set the background color to have some alpha,
and use the backdrop-filter property to get the blur:
{{< highlight css >}}
.page\_\_body {
background-color: #3c3836a4;
backdrop-filter: blur(10px);
}
{{< /highlight >}}

And that's it! I didn't mention a lot of the quirks of getting all this to work
with hugo, and a custom theme, but that probably wouldn't have been so difficult
if I understood hugo better. I think the effect looks really nice, although
admittedly it might be a bit distracting for anything but a splash page.

_[Update 2025-10-31]_

The background has now been rewritten in Rust and WASM. It's (upsettingly) not
much faster at the moment, but hopefully will be easier to rewrite in an
efficient way in future.
