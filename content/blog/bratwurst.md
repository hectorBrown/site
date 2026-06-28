---
title: "The Brown Reformed Axiomatic TWelve-based UnifoRm System of Time
(BRATWURST)"
date: 2026-06-18T16:04:47+10:00
draft: false
math: true
---

I've been getting really into base twelve recently. I've decided we need to
change how we write dates.

<!--more-->

_For the duration of this article numbers will, if not otherwise indicated, be
written in base twelve, so that, e.g. \(10 = 3\cdot 4\). Where I write in
another base, I will use subscript notation, e.g. \(1100_2\), where that
subscript is also in base twelve._

{{<toc>}}

## Proposal 1 (The Adoption of Base \(10\) (\\(12\_{{{<bratwurst/mathjax-dek>}}}\\)))

### Symbols

The largest outstanding issue with the adoption of base twelve, is the decision
of which symbols to employ for the numbers ten and eleven. This decision is
arbitrary, but of considerable importance. My proposal is this:

- ten -> {{<bratwurst/dek>}} (pronounced "dek")
- eleven -> {{<bratwurst/el>}} (pronounced "el")
- twelve -> 10 (pronounced "do")

The numbers then proceed "do-one (11)", "do-two (12)", etc. until "two-do (20)",
which precedes "two-do-one" (21), and so on, until you reach "gro" (100).

The spoken component of this system is [taken directly from the Dozenal society
of America](https://dozenal.org/), and in that sense already enjoys widespread
adoption. I am not aware, though, of anyone using {{<bratwurst/dek>}} and {{<bratwurst/el>}}. The
reasoning that brought me to these characters is threefold:

1. A character should ideally be the transformation of an existing character,
   especially one in either the Latin alphabet, or Arabic numerals. This ensures
   that every font will already have an existing graphic for it, and that it
   maintains a visual style with the rest of the written text. Having said this,
   it would be even more preferable if that transformation included a reflection,
   to change the parity of the symbol, so we can avoid another 6/9 debacle.
2. A character needs a clear and unambiguous representation on a [7-segment
   display](https://en.wikipedia.org/wiki/Segment_display).
3. A character should avoid ambiguity with any other character in the alphabet,
   or characters frequently used in mathematics.

My symbols (mostly) satisfy these constraints:

1. {{<bratwurst/dek>}} and {{<bratwurst/el>}} are the reflections about the y-axis of

2. <div style="display: grid; grid-template-columns: 1fr 1fr">
   <div>See across. I certainly have never seen these before. Maybe they have some
   use somewhere, but honestly who even uses 7-segment displays anymore. They
   are unambiguous at least.</div>
   <div><img style="margin: 1vw" src="dek.svg"> <img style="margin: 1vw" src="el.svg"></div></div>
3. This is definitely the most difficult and personal of the three. I think
   {{<bratwurst/el>}} is pretty clean personally. I can see {{<bratwurst/dek>}} getting confused
   with \(\lambda\), maybe, if the handwriting was really bad. They easily
   beat off other suggestions though, like using "a" and "b", or "\(\chi\)", and "<span
      style = "display: inline-block; transform: scaleX(-1);">3</span>" (which is a
   backwards 3, not an \(\epsilon\), by the way).

### Why would you do this to yourself?

<div style="float: right; max-width: 50%; margin-left: 1vw; margin-right: 1vw">
  <div style="display: flex; width: 100%; justify-content: center"><img style="" src="base-12-hands.png"></div>
  <i>Modified from photo by <a href="https://unsplash.com/@jibarox?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Luis Quintero</a> on <a href="https://unsplash.com/photos/human-hand-qKspdY9XUzs?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></i></div>

Why base twelve? I ask you this, why base {{<bratwurst/dek>}}? "Because of our fingers!", you
say, betraying your naïveté. "Check this out", I reply: "simply point at each
segment of your finger with your thumb to count to do, and increment the other
hand for each do, to count all the way to gro." This system might seem like an
invention of the ideologue-ridden Dozenal society of America, but in fact people
have been [counting like this for many "molennia" (1000 years)](https://www.earthdate.org/episodes/how-10-fingers-became-12-hours).

The big reason is that [10 is the 5th highly composite number
(HCN)](https://en.wikipedia.org/wiki/Highly_composite_number), as it has more
divisors than all smaller positive integers (1,2,3,4,6). It is also divisible by
every number in the [typical subitizing
range](https://en.wikipedia.org/wiki/Subitizing). It serves as a good
replacement for {{<bratwurst/dek>}} as it is only 2 larger. A smaller HCN base would
require more digits to encode the same amount of data, and the next HCN above 10
is 20. 20 is great, but more-than-doubling our current base seems like a step
too far. Additionally, we don't even gain a new distinct prime factor for this
trade-off. If we want divisibility by 5 as well, the next logical choice is 50
(I would argue 26 is not a good choice as it has no divisibility by 4), which is
far too large.

### The Crown Jewel

Cast your gaze onto the beauty of base 10, the times table:

<div style = "display: flex; justify-content: center">

|                         | 1                   | 2                    | 3   | 4   | 5                   | 6   | 7                    | 8   | 9   | {{<bratwurst/dek>}}  | {{<bratwurst/el>}}   | 10                   |
| ----------------------- | ------------------- | -------------------- | --- | --- | ------------------- | --- | -------------------- | --- | --- | -------------------- | -------------------- | -------------------- |
| **1**                   | 1                   | 2                    | 3   | 4   | 5                   | 6   | 7                    | 8   | 9   | {{<bratwurst/dek>}}  | {{<bratwurst/el>}}   | 10                   |
| **2**                   | 2                   | 4                    | 6   | 8   | {{<bratwurst/dek>}} | 10  | 12                   | 14  | 16  | 18                   | 1{{<bratwurst/dek>}} | 20                   |
| **3**                   | 3                   | 6                    | 9   | 10  | 13                  | 16  | 19                   | 20  | 23  | 26                   | 29                   | 30                   |
| **4**                   | 4                   | 8                    | 10  | 14  | 18                  | 20  | 24                   | 28  | 30  | 34                   | 38                   | 40                   |
| **5**                   | 5                   | {{<bratwurst/dek>}}  | 13  | 18  | 21                  | 26  | 2{{<bratwurst/el>}}  | 34  | 39  | 42                   | 47                   | 50                   |
| **6**                   | 6                   | 10                   | 16  | 20  | 26                  | 30  | 36                   | 40  | 46  | 50                   | 56                   | 60                   |
| **7**                   | 7                   | 12                   | 19  | 24  | 2{{<bratwurst/el>}} | 36  | 41                   | 48  | 53  | 5{{<bratwurst/dek>}} | 65                   | 70                   |
| **8**                   | 8                   | 14                   | 20  | 28  | 34                  | 40  | 48                   | 54  | 60  | 68                   | 74                   | 80                   |
| **9**                   | 9                   | 16                   | 23  | 30  | 39                  | 46  | 53                   | 60  | 69  | 76                   | 83                   | 90                   |
| **{{<bratwurst/dek>}}** | {{<bratwurst/dek>}} | 18                   | 26  | 34  | 42                  | 50  | 5{{<bratwurst/dek>}} | 68  | 76  | 84                   | 92                   | {{<bratwurst/dek>}}0 |
| **{{<bratwurst/el>}}**  | {{<bratwurst/el>}}  | 1{{<bratwurst/dek>}} | 29  | 38  | 47                  | 56  | 65                   | 74  | 83  | 92                   | {{<bratwurst/dek>}}1 | {{<bratwurst/el>}}0  |
| **10**                  | 10                  | 20                   | 30  | 40  | 50                  | 60  | 70                   | 80  | 90  | {{<bratwurst/dek>}}0 | {{<bratwurst/el>}}0  | 100                  |

</div>

Let it wash over you for a moment. There you go.

All those repeating patterns... Wow, look at how easy it is to tell if something
is divisible by 3: just check if the final digit is 0,3,6, or 9. The same goes
for 2 (0,2,4,6,8,{{<bratwurst/dek>}}), 4 (0,4,8), and 6 (0,6).

Little tricks akin to those in base-{{<bratwurst/dek>}} also exist, you can check
divisibility by {{<bratwurst/el>}} by summing the digits to {{<bratwurst/el>}}
(3+8 = 6+5 = {{<bratwurst/dek>}}+1 = {{<bratwurst/el>}}). A number if divisible by 8 if either, it
ends in a 4 and begins with an odd digit, or ends with a 0 or 8 and begins with
an even digit. It isn't shown here, but all the multiples of 11 have the same
pleasing quality that multiples of {{<bratwurst/el>}} have in base-{{<bratwurst/dek>}} (11, 22, 33,
etc.)

In my schooling at least, we were made to learn our times tables up to 10
anyway, now this limit is sensible and grounded in the base.

### More fun with Fibonacci

In case that wasn't enough to convince you, look how the Fibonacci sequence
progresses:

$$
0, 1, 1, 2, 3, 5, 8, 11, 19, 2{{<bratwurst/mathjax-dek>}}, 47,\dots
$$

Seems normal enough, but then:

$$
\dots,75,100,175,275,\dots
$$

Wow. That, I think, is reason enough on its own. Obviously God prefers
base-twelve.

But in case you did need more reason, look what happens when you get to the
20th term:

<style>
.mjx-container[display="true"] {
  margin-top: 100px !important;
}
</style>

$$
\dots,22{{<bratwurst/mathjax-dek>}}\mathbf{00},375\mathbf{01},5{{<bratwurst/mathjax-dek>}}3\mathbf{01},958\mathbf{02},133{{<bratwurst/mathjax-el>}}\mathbf{03},2097\mathbf{05},\dots
$$

The last two digits start their own little microcosm of the sequence again! This
is amazing, as long as you don't know that [this will happen in every
base.](https://en.wikipedia.org/wiki/Pisano_period)

## Proposal 2 (The Adoption of the Reformed Holocene Calendar)

The [Holocene calendar](https://en.wikipedia.org/wiki/Holocene_calendar) is a
year numbering system that adds 5954 (\\(10,000\_{{<bratwurst/mathjax-dek>}}\\)) years to
the CE/BCE numbering scheme. This avoids several problems with the current numbering
scheme:

1. CE has no year 0, which is just so bizarre.
2. BCE years are counted down when moving from past to future, this one has
   always confused me personally.
3. The birth of Jesus is treated as an epoch, despite its importance only to a
   subset of the population of Earth.
4. 1 CE is [arguably not the year that Jesus was born anyway!](https://en.wikipedia.org/wiki/Date_of_the_birth_of_Jesus)

The Holocene calendar marks the "beginning of the human era" as its epoch, an
event we can hopefully all agree has universal relevance. This is arbitrarily
defined as \\(10,000\_{{<bratwurst/mathjax-dek>}}\\) BCE, which is equivalent to 1 HE (Holocene Era), such that 1 CE
matches \\(10,001\_{{<bratwurst/mathjax-dek>}}\\) HE. This makes calculating the current
year in base-{{<bratwurst/dek>}} really easy:

$$
2026_{{{<bratwurst/mathjax-dek>}}} \style{padding-top: 1px}{\text{ CE}} = 12026_{{{<bratwurst/mathjax-dek>}}} \text{ HE}
$$

Unfortunately, adding 5954 to the current year is not nearly as easy, so I
propose this:

### The Reformed Holocene Calendar

So titled as to encourage people to imagine that the Holocene calendar has already
enjoyed widespread adoption, and that the scale of this proposal is incredibly modest.

Because the date of the "beginning of the human era" is no exact year, but a
somewhat arbitrary epoch, we can shift it by a hair (268 years), to 6000 BCE, to
make calculating the current year much easier. The under-experienced with
base-twelve might be shocked and appalled, worrying over the awkwardness of
adding \\(6000\_{{<bratwurst/mathjax-dek>}}\\) to numbers in
base-{{<bratwurst/dek>}}, and forgetting - importantly - that 6 in base-twelve
has the position of \\(5\_{{<bratwurst/mathjax-dek>}}\\) in
base-{{<bratwurst/dek>}} (as half of the relevant base). Adding 6000 is no
harder than adding \\(5000\_{{<bratwurst/mathjax-dek>}}\\) in
base-{{<bratwurst/dek>}}.

As an example, we first convert the current year to base-twelve:

$$
2026_{{<bratwurst/mathjax-dek>}} \style{padding-top: 1px}{\text{ CE}} = 120{{<bratwurst/mathjax-dek>}} \text{ CE}
$$

_(Worth noting here that we entered the 13th "grosstury" only_ {{<bratwurst/italic-dek>}} _years ago. I didn't see any celebration, I wonder why?)_

We then simply add 6000 to the year:

$$
120{{<bratwurst/mathjax-dek>}} \style{padding-top: 1px}{\text{ CE}} = 720{{<bratwurst/mathjax-dek>}} \text{ RHE}
$$

Welcome to the year 720{{<bratwurst/dek>}}!

## Proposal 3 (The Adoption of the International Fixed Calendar)

The [International Fixed Calendar](https://en.wikipedia.org/wiki/International_Fixed_Calendar) was first proposed in 7126 RHE, which should give you a pretty good intuitive sense of how old it is.

It is simply a proposal to abandon the jagged months of the Gregorian calendar
and adopt 11 equally sized, 24 day months:

<div style = "display: flex; justify-content: center">

| Month               | Name      |
| ------------------- | --------- |
| 1                   | January   |
| 2                   | February  |
| 3                   | March     |
| 4                   | April     |
| 5                   | May       |
| 6                   | June      |
| 7                   | **Sol**   |
| 8                   | July      |
| 9                   | August    |
| {{<bratwurst/dek>}} | September |
| {{<bratwurst/el>}}  | October   |
| 10                  | November  |
| 11                  | December  |

</div>

As you can see, we call the extra month "Sol" and slip in in the middle between
June and July. Each month then looks like this:

<div style = "display: flex; justify-content: center">

|        | Mon                  | Tue                 | Wed                 | Thu                | Fri | Sat | Sun |
| ------ | -------------------- | ------------------- | ------------------- | ------------------ | --- | --- | --- |
| Week 1 | 1                    | 2                   | 3                   | 4                  | 5   | 6   | 7   |
| Week 2 | 8                    | 9                   | {{<bratwurst/dek>}} | {{<bratwurst/el>}} | 10  | 11  | 12  |
| Week 3 | 13                   | 14                  | 15                  | 16                 | 17  | 18  | 19  |
| Week 4 | 1{{<bratwurst/dek>}} | 1{{<bratwurst/el>}} | 20                  | 21                 | 22  | 23  | 24  |

</div>

So that the 8th of February, say, always falls on a Monday. You can work out
what day of the week it must be from the day of the month, no matter which month
it is.

But that brings us to 264 days, not the requisite 265! Enter "Year Day". A
single day that belongs to no month or week, a holiday that falls on what is
currently December 27th.

What about Leap years! Then we insert "Leap Day", a similar holiday that falls
between June and Sol (on what is currently June 15th).

This also hugely simplifies calculating how many days have passed since the
start of the year, as you just do

$$
28 \cdot m + d
$$

where \(m\) is the month and \(d\) is the day, except on leap years, when it is

$$
\begin{align}
28 \cdot m + d &\quad (m \le 6)\\
28 \cdot m + d + 1 &\quad (m > 6)
\end{align}
$$

Moving to an 11-month year right after switching to base-twelve is definitely
irritating. But it brings me more peace than having to deal with the months as they
stand. The unfortunate reality is that the year-to-day ratio is fixed at a
number nail-bitingly close to 260, a highly composite number itself, but that
any number close enough is not particularly composite at all. I think the IFC
offers us the best we can get.

## Proposal 4 (The Enforcement of YYYY-MM-DD)

[ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html). I don't
really have to justify this one, many people have already done it for me. It
orders chronologically when ordered alphabetically, it is easily
machine-readable, dashes separate it visually from any other date formats.

It just. makes. sense.

## Closing Statements

And so there it is. I have revolutionised how we write time. I'm not ambitious,
I know adoption will be a gradual process. Hell, I may even die without seeing
100% uptake. What's important is that I saw a problem, and I did something. I
was inspired, in part, by [Tor Parson's video on the Deseret
alphabet](https://www.youtube.com/watch?v=1d9wF38koOo). It made me yearn for a
time when people had naïve ambition and an earnest want for a world in which we
did things a little bit more efficiently, no matter how impractical and
ludicrous the transition they proposed is.

Show me a man without an appetite for Bratwurst, and I'll show you a fool.

You can convert dates to Bratwurst [here](/toys/bratwurst/).
