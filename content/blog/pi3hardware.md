---
title: "Getting hardware H264 encoding/decoding working on my Raspberry Pi 3B+"
date: 2025-06-10T18:32:11+12:00
draft: true
---

In my [previous post](../tdarr/) I detailed how Tdarr is useful to me in my
setup, and at the very end I mentioned that I estimated it would take about half
a month for all my media to run through the processing stack, maybe a bit less.
That's a while, and all that while some of my services are pretty unreliable -
despite Tdarr only creating low-priority threads to do it's little tasks with -
experiencing random crashes, corrupted backups, and slow load times.

<!--more-->

I had written off the concept of hardware encode/decode since [the Raspberry Pi
5 (which is the most powerful part of my stack) only has H265
decode](https://www.raspberrypi.com/news/introducing-raspberry-pi-5/#comment-1594055).
But I got thinking, well if the Pi 5 has H265 decode, maybe the older models
came with H264 hardware... And lo and behold, [the very same Pi 3B+ that I own
comes with a Broadcom VideoCore IV chip that is capable of hardware H264
encode/decode](https://forums.raspberrypi.com/viewtopic.php?t=2886).
