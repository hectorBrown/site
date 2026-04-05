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

{{< toc >}}

## An oh-so-brief introduction to shaders
