---
title: "Pendulums"
date: 2023-04-14T15:10:56+01:00
draft: false
---

<div id="pend-parent" style="width: 100%; height: auto;"></div>
<script src="https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js"></script> <!-- load p5.js from CDN--> 
<script src="/scripts/phys/pend/pend.js"></script>

<style>
    #control-panel {
        display: grid;
        grid-row-gap: 0.5rem;
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
</style>

<div id="control-panel">
    <div>
    <div style="margin: 1vw">
        <input type="range" min="-1" max="2" value="0" step="0.01" class="slider" id="m1"></input>
        <p>\( m_1 \): <span id="m1_out"></span></p>
    </div>
    <div style="margin: 1vw">
        <input type="range" min="-1" max="2" value="0" step="0.01" class="slider" id="m2"></input>
        <p>\( m_2 \): <span id="m2_out"></span></p>
    </div>
    <div style="margin: 1vw">
        <input type="range" min="0.1" max="1" value="0.5" step="0.01" class="slider" id="l1"></input>
        <p>\( l_1 \): <span id="l1_out"></span></p>
    </div>
    <div style="margin: 1vw">
        <input type="range" min="0.1" max="1" value="0.5" step="0.01" class="slider" id="l2"></input>
        <p>\( l_2 \): <span id="l2_out"></span></p>
    </div>
    <div style="margin: 1vw">
        <input type="range" min="-3.14" max="3.14" value="2" step="0.01" class="slider" id="theta_0"></input>
        <p>\( \theta_0 \): <span id="theta_0_out"></span></p>
    </div>
    <div style="margin: 1vw">
        <input type="range" min="-3.14" max="3.14" value="0" step="0.01" class="slider" id="phi_0"></input>
        <p>\( \phi_0 \): <span id="phi_0_out"></span></p>
    </div>
    <div style="margin: 1vw">
        <input type="range" min="-1" max="2" value="1" step="0.01" class="slider" id="g"></input>
        <p>\( g \): <span id="g_out"></span></p>
    </div>
    </div>
    <div>
        <p>\( \theta \): <span id="theta"></span></p>
        <p>\( \phi \): <span id="phi"></span></p>
        <p>\( \frac{d\theta}{dt} \): <span id="alpha"></span></p>
        <p>\( \frac{d\phi}{dt} \): <span id="beta"></span></p>
        <p>\( T \): <span id="T"></span></p>
        <p>\( V \): <span id="V"></span></p>
        <label class="checkbox">Trace: <input type="checkbox" checked="checked" id="trace"></input><span class="checkmark"></span></label>
</div>

[Source](/scripts/phys/pend/pend.js)
