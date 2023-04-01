---
title: "Boids or bust"
date: 2023-03-30T22:20:24+01:00
draft: false
---

The last [post](/blog/p5js) completely ignored the actual animation my
[homepage](/) is running... mostly because I wanted to focus on the general
idea, rather than my implementation. However,
[boids](https://en.wikipedia.org/wiki/Boids) are pretty interesting, and maybe
simpler than they look, so I thought I'd write about how I set them up.
<!--more-->
{{< toc >}}

## What are they?

Boids were first developed by Craig Reynolds in 1986 to simulate life,
specifically the flocking behaviour of birds. The simulation displays emergent
behaviour, specifically the fact that complex flocking emerges from just three
simple rules:

1. Boids will steer to separate themselves from their neighbours.
2. Boids will steer so as to align their direction of flight with their
   neighbours.
3. Boids will steer towards the average position of their neighbours.

Obviously, rules 1 and 3 seem to be in direct conflict, but it is exactly this
negative feedback that produces the unique motion.

## The creation of the boid

I put together a little sprite, gave the boid a direction, speed and random starting position and voila:
<div id="eg-1-parent" style="width: 100%; height: auto;"></div>
<script src="https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js"></script> <!-- load p5.js from CDN--> 
<script src="/scripts/blog/boids/eg-1.js"></script>

It's alive! This guy steers randomly and has some extra
[code](/scripts/blog/boids/eg-1.js) to make him behave well and stay within his
canvas, but that's just to make it more fun to look at. Let's [add](/scripts/blog/boids/eg-2.js) a few more:

<div id="eg-2-parent" style="width: 100%; height: auto;"></div>
<script src="/scripts/blog/boids/eg-2.js"></script>

Honestly, they look quite nice as is, but after maybe a couple hours of staring that might start to get a bit old. It's important that they interact with eachother.

## 3 simple rules

The interaction boils down to deciding which way to steer each boid at every step. To do this, we create 3 "steer vectors", each associated with a rule. Summing them, we determine if that vector points left or right relative to the boid's current direction, and steer accordingly.

Boids only interact with their neighbours too, so these vectors will only depend on the other boids that are within some fixed radius of the one we are steering.

<style>
   .rule-images {
      float: right;
      width: 50%;
   }
   @media screen and (max-width: 600px) {
      .rule-images {
         width: 100%;
      }
   }
</style>
<ol>
   <li><div style="overflow: auto"><b>Separation</b><br><img src="/images/blog/boids/separation.png" class="rule-images"/>
   The separation vector is probably the most complicated. It is calculated by taking the distance vectors (displayed in blue) to each neighbour, and weighting them by the inverse of their magnitudes. This step ensures that boids that are very close have more of an effect on the final steer, which preserves the spirit of the rule: to avoid overcrowding.

   These inverse distances are summed, and the negative of the resultant vector is taken (displayed in orange).
   </div></li>
   <li><div style="overflow: auto"><b>Alignment</b><br><img src="/images/blog/boids/alignment.png" class="rule-images"/>
   This one is much easier. It's as simple as finding vectors corresponding to each neighbouring boid's direction (blue) and then taking an average (orange).
   </div></li>
   <li><div style="overflow: auto"><b>Cohesion</b><br><img src="/images/blog/boids/cohesion.png" class="rule-images"/>
   Again, pretty simple. We find the average position of the neigbours (blue dot) and steer towards it.
   </div></li>
</ol>

And that should be pretty much it, so let's [implement](/scripts/blog/boids/eg-3.js) them:

<div id="eg-3-parent" style="width: 100%; height: auto;"></div>
<script src="/scripts/blog/boids/eg-3.js"></script>

Pretty cool! This is super slow though. Every boid checks every other boid in the field, which gives it \\( \textrm{O} (n^2) \\) time. The example above should run pretty smoothly, depending on your device, but for numbers of boids of order 100 it should start to get choppy on modern hardware.

## Ugh so slow

The method I used to optimise my boids is stolen, shamelessly, from [this](https://www.youtube.com/watch?v=bqtqltqcQhw) fantastic video by Sebastian Lague. The concept is that each boid will belong to a zone, i.e. a square with a side length equal to the radius of a boid's local area. With this, we only need to check the neighbouring zones for boids that might lie within that zone, which (providing the boids aren't all very close together), should speed things up considerably.

<div id="eg-4-parent" style="width: 100%; height: auto;"></div>
<script src="/scripts/blog/boids/eg-4.js"></script>

In these examples, there are 10 boids. In the [optimized version](/scripts/blog/boids/eg-4.js), the boid in focus is checking <span id="eg-4-check-counter"></span>, instead of the original 9.

And that's pretty much it. I added some other stuff to the [actual background](/scripts/index_background.js): a sigmoid response to the steer vector, so they don't turn so dramatically for things that are basically just in front of them; scaling the separation vector by the neighbour count squared, to prevent them from forming one huge flock, which isn't very interesting; and a bit of random steer just for fun, but a purist would probably be against that.

I think emergent behaviour like this is really fascinating, and it's remarkably easy to get some really cool graphics with hardly any code.
