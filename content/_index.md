---
title: ""
date: 2023-03-16T22:48:23Z
draft: false
---

<p style="height: 33%">
I'm Hector. I write code for fun, and I'd like to do it professionally too.
</p>

---

The background is accelerated with [WebGPU](https://webgpu.org/), you can learn
about how it was made [here](./blog/webgpu).

<style>
#control-panel {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1vw 2vw;
    margin: 1vw;
  }
  .control-row {
    display: contents; /* allows grid children to be direct grid items */
    margin: 1vw;
  }
</style>

<div id="control-panel">
  <div class="control-row">
    <label for="sep-slider">Separation:</label>
    <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="sep-slider">
  </div>
  <div class="control-row">
    <label for="sep-slider">Alignment:</label>
    <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="ali-slider">
  </div>
  <div class="control-row">
    <label for="sep-slider">Coherence:</label>
    <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="coh-slider">
  </div>
</div>
