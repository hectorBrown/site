---
title: "FFT"
date: 2024-10-13T13:16:27+01:00
draft: false
---

<div id="waves-parent" style="width: 100%; height: auto;"></div>
<div id="fft-parent" style="width: 100%; height: auto;"></div>
<script src="https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js"></script> <!-- load p5.js from CDN-->
<script src="https://cdn.jsdelivr.net/npm/mathjs@14.1.0/lib/browser/math.min.js"></script>
<script src="/scripts/phys/fft/fft.js"></script>

<style>
    #control-panel {
        display: grid;
        grid-row-gap: 1rem;
        grid-template-columns: 3fr 1fr;
        grid-column-gap: 1rem;
    }
    @media (max-width: 800px) {
        #control-panel {
            grid-template-columns: 2fr 1fr;
        }
    }
    @media (max-width: 500px) {
        #control-panel {
            grid-template-columns: 1fr;
        }
    }
    button {
      appearance: none;
      background-color: var(--muted);
      border: 0px solid var(--bg);
      border-radius: 6px;
      color: var(--fg);
      cursor: pointer;
      display: inline-block;
      font-family: var(--font-monospace)
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      padding: 6px 16px;
      position: relative;
      text-align: center;
      text-decoration: none;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      vertical-align: middle;
      white-space: nowrap;
    }

    button:focus:not(:focus-visible):not(.focus-visible) {
      box-shadow: none;
      outline: none;
    }

    button:hover {
      background-color: var(--hover);
      color: var(--muted);
    }

    button:focus {
      box-shadow: rgba(46, 164, 79, .4) 0 0 0 3px;
      outline: none;
    }

    button:disabled {
      background-color: #94d3a2;
      border-color: rgba(27, 31, 35, .1);
      color: rgba(255, 255, 255, .8);
      cursor: default;
    }

    button:active {
      background-color: var(--link);
      color: var(--muted);
      box-shadow: rgba(20, 70, 32, .2) 0 1px 0 inset;
    }
</style>

<div id="control-panel">
  <div>
    <div style="margin: 1vw">
        <button id="reset_button" role="button">Reset</button>
        <button id="play_button" role="button">Play</button>
    </div>
  </div>
</div>
