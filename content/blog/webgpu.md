---
title: "Another unnecessary upgrade to my homepage background"
date: 2026-04-05T22:19:44+10:00
draft: true
---

Each is more labour-intensive and pointless than the last, but I can't help
myself. This time I finally finished moving the rendering code from
[macroquad](https://macroquad.rs/) to [WebGPU](https://webgpu.org/) so I can
take advantage of your laptop's GPU, not to [mine Bitcoin like I should be
doing](https://bhavyansh001.medium.com/the-dark-side-of-webgpu-nobody-is-talking-about-28e2903234da)
but to draw many more boids at the same time. This is all with the eventual goal
of designing a compute shader that will run the logic of the boids simulation,
but unfortunately [WebGPU is still only in Firefox Nightly for
Linux](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status).

<!--more-->

That means, that unfortunately, I am still only running WebGL2 at the moment,
which is a bit of a bummer. But it comes with a promise that the boids will be
ready as soon as Firefox is.

I've explained what boids are in detail [previously](/blog/boids), so I won't
go into that again here. Instead, I'll stick to what I learned about WebGPU and
shaders while implementing this.

Most of my understanding of WebGPU and shaders comes from [this excellent
tutorial](https://sotrh.github.io/learn-wgpu/). In fact, it does such a good job
of covering the technical details that I will omit them here, and focus on my
specific implementation, as well as building intuitions about how GPU processing
works.

{{< toc >}}

## An oh-so-brief introduction to shaders

<style>
   .float-images {
      float: right;
      width: 50%;
      margin: 1vw;
   }
   @media screen and (max-width: 600px) {
      .float-images {
         width: 100%;
      }
   }
</style>

In broad strokes, there are two main types of shaders (excluding compute shaders
for simplicity).

<!--TODO: link NDC to header i'm gonna write about it later-->
<ol>
  <li>
    <b>Vertex Shaders</b>
    <img src="/images/blog/webgpu/vertex.svg" class="float-images" alt="A diagram of a
      vertex shader producing instanced points">
    <p>These typically run first, and are responsible for transforming input
      points onto output points. I know that sounds a little vague, so to make
      things more concrete, imagine 3D rendering. The vertex shader in this case
      is responsible for transforming points from "game space" - i.e. the 3D
      world in which objects in the game live - to "screen space", the
      coordinates of pixels on your screen (or rather <a
        href="https://learnopengl.com/Getting-started/Coordinate-Systems">NDC
        coordinates</a>, but that's not particularly important here). In
      instanced drawing, as we'll see later, they can be used to draw repeated
      copies of the same set of points at different positions and rotations
      (like in the diagram opposite). </p>
  </li>
  <li>
    <b>Fragment Shaders</b>
    <img src="/images/blog/webgpu/tri.svg" class="float-images" alt="A diagram of a
      triangle being rendered by the GPU">
    <p>These take the vertices from the vertex shaders as input, typically in
      groups of 3 that form triangles, and draw colours in the area defined by
      the triangles' boundaries. These colours could be fixed, or they could be
      sampled from some texture. The other requirement here is that triangles
      are drawn in an anti-clockwise direction (by default), which avoids (again
      in 3D graphics) trying to render the "backs of shapes". To better
      understand this, imagine a cube, where the triangles were drawn in such a
      way that the anti-clockwise winding defined their "forward" faces as those
      on the outside. Not drawing the triangles when they are presented in a
      clockwise order means that the GPU need only draw the faces of the cube
      that are actually visible to the camera - without any extra logic to
      determine which faces these are.</p>
  </li>
</ol>

- Indexed drawing
- Instancing
- Buffers
- Bind groups
- NDC coords and transformation
- My code:
  - Project structure
  - Converting to Raw
  - Pixel to NDC
  - Staging buffers
  - Drawing lines
  - transformations as single matrices (incl NDC)
