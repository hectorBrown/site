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
        href="#normalized-device-coordinates-ndc">NDC coordinates</a>, but
      that's not particularly important here). In instanced drawing, as we'll
      see later, they can be used to draw repeated copies of the same set of
      points at different positions and rotations (like in the diagram
      opposite). </p>
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

## Indexed drawing

A lot of the bottlenecks that crop up when you work with GPUs are related to
copying data from CPU-accessible memory to GPU-accessible memory. This is slow
for two main reasons: there is a limited bandwidth for this copying, and often
copying involves blocking one or both of the CPU and GPU while the transfer is
happening. Because of this, a lot of optimisations we'll see are to do with
reducing the amount of data you need to copy. Indexed drawing is the first
"compression" technique we'll see.

<img src="/images/blog/webgpu/indexed.svg" class="float-images" alt="A diagram
  of indexed drawing">

If we want to draw two triangles with only four points, as in the digram
opposite, we can use indexed drawing to avoid having to copy the same points
over and over again. Instead of copying the points of each triangle, we set up
an array that contains only the points A, B, C, and D:

```rust
let vertices = [A, B, C, D];
```

and an index array that specifies which points to use for each triangle, by index:

```rust
let indeces = [0,1,2,0,2,3];
```

There are many indeces that will produce the same shape, such as `[0,1,2,2,3,0]`
or `[2,0,1,0,2,3]`, but all of them will just be permutations of the same points
(done cyclically, for each of the first and second sets of 3 points).

Here is a real example from my code where I draw a primitive "thick line" shape
(just a rectangle) using indexed drawing:

```rust
pub const VERTICES: &[SimpleVertex] = &[
    SimpleVertex {
        position: [0.0, THICKNESS / 2.0],
    }, // A
    SimpleVertex {
        position: [0.0, -THICKNESS / 2.0],
    }, // B
    SimpleVertex {
        position: [1.0, THICKNESS / 2.0],
    }, // C
    SimpleVertex {
        position: [1.0, -THICKNESS / 2.0],
    }, // D
];

pub const INDICES: &[u16] = &[0, 2, 3, 0, 3, 1];
```

## Instancing, for instance

Instancing is another layer of optimisation on top of this in which we want to
(as we so often do in graphics) draw very many copies of the same shape, but
with different positions and rotations. We use the same vertex and index arrays
as before, but for instancing we get the chance to pass a new array to the GPU.
This could contain whatever we like, but a typical use would be a matrix that
encodes some transformation to apply to the vertices.

Lets continue using this line example. Let's say we want to draw a line from
point \\(\vec{b_1}\\) to point \\(\vec{b_2}\\). In order to do this, we need to apply 3
separate transformations to the vertices of our line shape:

1. Stretch the line to the length of the vector \\(\vec{b_2} - \vec{b_1}\\).
2. Rotate the line by the angle \\(\theta\\), where \\(\theta\\) is the angle of
   the vector \\(\vec{b_2} - \vec{b_1}\\).
3. Translate the line onto the position \\(\vec{b_1}\\).

We could do these, one by one, in the vertex shader, but that includes a lot of
redundant calculations. We get the separation vector, length, and angle (the
latter two of which are expensive time-wise), for every single vertex, rather
than just calculating them once per line. So instead, we calculate them on the
CPU ahead of time, calculate the matrix that encodes these successive
transformations, and then pass that to the shader to apply to every vertex in
the shape. The matrix for this example would look like this:

$$
\begin{pmatrix}
\cos{\theta}\cdot|\vec{b_2} - \vec{b_1}| & -\sin(\theta) & \vec{b_1}_x \\\\
\sin{\theta}\cdot|\vec{b_2} - \vec{b_1}| & \cos{\theta} & \vec{b_1}_y
\end{pmatrix}
\cdot
\begin{pmatrix}
\vec{v}_x \\\\
\vec{v}_y \\\\
1
\end{pmatrix}
$$

Where \\(\vec{v}\\) is the vertex we want to transform. My implementation in
Rust looks like this:

```rust
let sep = position2 - position1;
let dir = sep.y.atan2(sep.x);
let length = sep.magnitude();
LineRaw {
    transformation: [
        [dir.cos() * length, -dir.sin(), position1.x],
        [dir.sin() * length, dir.cos(), position1.y],
    ],
    alpha: (max_line_length - length) / max_line_length,
}
```

where our instance array also includes an alpha field that determines the
opacity of the line (it is passed straight through to the fragment shader).

<img src="/images/blog/webgpu/instancing.svg" style="display: block; margin: 0
auto" alt="A diagram of the full path of vertices through an indexed and
  instanced drawing pipeline">

## Buffering...

Up until now, I've been talking vaguely about "arrays" accessible to both the
GPU and CPU. Of course, in practice, we need to set up these arrays and
synchronise them across the gap. Enter buffers. We can create buffers like so
for the vertices of our thick line:

```rust
let line_vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
    label: Some("Line Vertex Buffer"),
    contents: bytemuck::cast_slice(thick_line::VERTICES),
    usage: wgpu::BufferUsages::VERTEX,
});
```

This `device.create_buffer_init` function is a helper that sizes a buffer and
copies an array into it in one step, but we also have the option of creating a
buffer of a certain size, and then copying data into it later. Later on when we
do a "render pass" (just rendering a frame), we can bind the buffer we created
to the GPU pipeline:

```rust
render_pass.set_vertex_buffer(0, self.line_vertex_buffer.slice(..));
```

We use slices here because we don't have to bind the whole buffer (in this case
the `..` notation represents a slice that includes every element). The first
argument, set to `0` is the "slot" that this buffer is bound to. We can actually
bind an arbitrary number of buffers, as long as we specify each as either a
vertex or instance buffer. What about data we want to be constant over every
instance and vertex, I hear you cry?

## Bind groups and uniform buffers

For that we use uniform buffers and bind groups. A uniform buffer is quite
literally just a buffer that is consistent across every vertex and instance.
This can be useful for things like camera projection matrices, which may need to
be updated when the user moves in game, but are constant within one frame. In my
case I use a uniform buffer to communicate the size of the screen to the
shader, which is important for converting from pixel coordinates to [NDC
coordinates](#normalized-device-coordinates-ndc) (which I will come on to in a moment).

A bind group is the modern WebGPU way of grouping together buffers, textures,
and samplers to be used in a shader. It bypasses the validation checks that
would otherwise be required if you bound every resource separately, and is,
therefore, faster. We create a "screen size buffer" like so:

```rust
let screen_size_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
    label: Some("Screen Size Buffer"),
    contents: bytemuck::cast_slice(&window_size_matrix(size.width, size.height)),
    usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
});
```

Here we see some different usage flags, `UNIFORM` should be obvious but
`COPY_DST` is also important, as it will allow us to copy new data into the
buffer later (when the window is resized). We then create the bind group:

```rust
let screen_size_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
    layout: &screen_size_bind_group_layout,
    entries: &[wgpu::BindGroupEntry {
        binding: 0,
        resource: screen_size_buffer.as_entire_binding(),
    }],
    label: Some("screen_size_bind_group"),
});
```

before we finally bind it to the render pass:

```rust
render_pass.set_bind_group(0, &self.screen_size_bind_group, &[]);
```

When the window is resized, updating the buffer is as simple as:

```rust
self.queue.write_buffer(
    &self.screen_size_buffer,
    0,
    bytemuck::cast_slice(&window_size_matrix(width, height)),
);
```

As before, rather than just communicating the window size to the shader, we
actually want to calculate the matrix that will convert from pixel coordinates
to NDC ahead of time, and then just pass that, to avoid performing that
calculation for every vertex. Speaking of NDC coordinates...

## Normalized Device Coordinates (NDC)

![Diagram of the difference coordinate systems (pixel and
NDC)](/images/blog/webgpu/ndc.svg)

NDC coordinates are the native coordinate system of the GPU, they literally
normalise the relation between position and screen position without any concern
about a device's actual resolution. The conversion in matrix form is:

$$
\begin{pmatrix}
\frac{2}{} & 0 & -1\\\\
0 & \frac{-2}{h} & 1
\end{pmatrix}
\cdot
\begin{pmatrix}
\vec{p}_x \\\\
\vec{p}_y \\\\
1
\end{pmatrix}
$$

where \\(w\\) is the screen width, \\(h\\) is the screen height, and
\\(\vec{p}\\) is the position in pixel coordinates. Here's that in Rust:

```rust
fn window_size_matrix(width: u32, height: u32) -> [[f32; 4]; 2] {
    [
        [2.0 / width as f32, 0.0, 0.0, -1.0],
        [0.0, -2.0 / height as f32, 0.0, 1.0],
    ]
}
```

You might notice that this matrix is actually 2x4, not 2x3 as is written above.
This is because GPU buffers have to be 16-byte aligned, so we have to pad the
matrix with an extra column of zeroes. We do this at the z-coordinate and move
the translation into the last column to follow convention. There is no real
reason to do one or the other, but in 3D graphics, the fourth column (or
w-coordinate) is typically reserved for translation.

- Texture sampling
- My code:
  - Project structure
  - Converting to Raw
  - Pixel to NDC
  - Staging buffers
  - Drawing lines
  - transformations as single matrices (incl NDC)
