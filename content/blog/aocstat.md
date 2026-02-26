---
title: "aocstat"
date: 2026-02-26T18:57:27+11:00
draft: false
---

I finally built a working version of
[aocstat](https://github.com/hectorBrown/aocstat), my command line interface for
Advent of Code. It only took me 4 years!

<!--more-->

There's not much to say about it, except that it (more or less) works, and that
I think it's a more natural way to interact with the data than the web
interface. I've got some more features I want to do, the most exciting being
configurable directory templates, so i could outline something like:

```
day_{{dayno}}/
  {dayno_input1}
  {dayno_input2}
  p1.py
  p2.py
```

And have the program auto-update the directory structure with available data
whenever it is run, to generate something like:

```
day_1/
  1_input1.txt
  1_input2.txt
  p1.py
  p2.py
day_2/
  2_input1.txt
  2_input2.txt
  p1.py
  p2.py
day_3/
  3_input1.txt
  p1.py
  p2.py
```

For example, if I had completed both parts of day 1 and 2, but not part 1 of
day 3. But that's another four years down the line.

Now I might actually start on the 2025 puzzles.
