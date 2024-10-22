---
title: "Being a Pushover"
date: 2024-10-22T15:28:43+01:00
draft: false
---

I discovered [Pushover](https://pushover.net/) while working on my home server,
and trying to find a way to send myself notifications about its status on my
phone. It's awesome.

<!--more-->

My issue was this. The media server I run streams video to clients around my
home, and elsewhere. Those clients, mostly, only have the ability to play
[x264](https://en.wikipedia.org/wiki/X264) video. I wanted to have my home
server convert video that might be in another format to x264 automatically, and
then I could place it on the media server. My home server, though, is a
Raspberry Pi 5, with no hardware support for x264 encoding. This is fine on its
own, I really don't mind waiting for it to transcode at ~0.25x speed, but I had
no way to tell when it had finished. For a while I sent myself emails about it.
This kind of worked, but often they would end up in spam (being from a no-name
domain like mine), and clogged up my email. Enter Pushover. For a one time
lifetime license fee you can send yourself as many annoying notifications as
your heart desires. And there are [so many
ways](https://support.pushover.net/i44-example-code-and-pushover-libraries) to
do it. They have an API for a vast number of languages, which makes sense,
because you can send a notification via curl too.

```bash
curl -s \
  --form-string "token=APP_TOKEN" \
  --form-string "user=USER_KEY" \
  --form-string "message=hello world" \
  https://api.pushover.net/1/messages.json
```

It's really that simple. Now my server can tell me when it's done. The app and
website are well designed and easy to use. You get a limit of 10,000 messages
per app, which I would never use (apart from the time my code broke and sent me
1,000 notifications every half hour for the 8 hours I was asleep). They're even
forgiving of API abuse, in my experience. It's such a useful tool to be able to
notify yourself of things in a script. And with curl installed almost
everywhere, any device/container with an internet connection and ability to
resolve a domain name can do it.
