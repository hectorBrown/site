---
title: ""
date: 2023-03-16T22:48:23Z
draft: false
---

<p style="height: 10%">
</p>

---

The background is accelerated with [WebGL](https://www.khronos.org/webgl/), you can learn
about [how I used wgpu](./blog/webgpu) or [what boids are](./blog/boids).

<style>
#control-panel {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1vw 2vw;
    margin: 1vw;
  }
  #control-panel {
    align-items: center; /* vertically centers the label and slider */
    gap: 1em;
    margin: 1vw;
  }
</style>

<div id="control-panel">
    <label for="sep-slider">Separation:</label>
    <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="sep-slider">
    <label for="sep-slider">Alignment:</label>
    <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="ali-slider">
    <label for="sep-slider">Coherence:</label>
    <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="coh-slider">
</div>
