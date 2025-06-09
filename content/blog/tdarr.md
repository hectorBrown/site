---
title: "Making my media nice with Tdarr"
date: 2025-06-09T17:51:52+12:00
draft: false
---

I've spent the last few weeks tinkering with [Tdarr](https://tdarr.io/), a media
transcoding and management tool. It's part of a larger stack I use to grab and
organise media, which often comes in a variety of codecs and formats.

<!--more-->

The primary problem I've been trying to solve, apart from a simmering anxiety
about disorganisation, is that streaming the media from my parent's home in the
UK to my hostel in New Zealand is not very fast. While the bitrate I can
comfortably achieve is definitely enough to stream reasonable quality 1080p
video, not all of the media is at that bitrate when I find it, and the puny
Raspberry Pi 5 I run the server on is not capable of transcoding it live (as
well as running my Nextcloud and Immich instances, poor thing).

{{<toc>}}

## A land before Tdarr

<style>
   .half-images {
      float: right;
      width: 60%;
      margin-top: 1vw;
      margin-bottom: 1vw;
      margin-right: 1vw;
      margin-left: 1vw;
   }
   @media screen and (max-width: 600px) {
      .half-images {
        width: calc(100% - 2vw);
      }
   }
</style>
<div style="overflow: auto; width: 100%">
  <img src="/images/blog/tdarr/pretdarr.png" class="half-images" alt="Pre-Tdarr
  media stack setup"/>

This diagram shows a simplified version of how my media server used to work. My
family and I would ask for media with [Jellyseer](https://docs.jellyseerr.dev/),
which would send a request to [Radarr](https://radarr.video/) or
[Sonarr](https://sonarr.tv/). Then Radarr/Sonarr would grab a download link (via
[Prowlarr](https://prowlarr.com/), not shown here), and send that link to
[qBittorrent](https://www.qbittorrent.org/). When qBittorrent was finished
downloading, Radarr/Sonarr would grab and rename the media into Jellyfin's
library to make it available for streaming.

This is great for watching media inside the same house as the server, or even
from the rest of the UK - and I suspect western Europe (untested as of now) -
when you get to the edge of civilization (Queenstown, NZ), though, things start
to fall apart. The eclectic range of sources Radarr finds for media produce
weird and wonderful results, with different audio and video codecs, channel
counts, subtitle formats, bitrates, and containers. [More of these options
aren't supported by all the clients you might want to use than
are](https://jellyfin.org/docs/general/clients/codec-support/), and at distance,
bitrate has to be used sparingly to avoid infurating stuttering. Although the
Raspberry Pi 5 is capable of remuxing, transcoding and downmixing audio, and
(just about) lowering video bitrate at fast presets, doing this takes it to the
edge, and stretches it farther than I'd like, which results in more latency
across any services running on the same metal and the occasional crash.

</div>

## Passive transcoding

Tdarr was designed primarily to re-encode your media library from x264 to the
newer and more efficient (and sexier) x265. I'm sure it does a great job at
that, but x265 is useless to me since it can't be decoded by a wide range of
clients yet. Luckily the software is very flexible and also allows you to
standardise your media in a wide variety of other ways.

The suggested use for Tdarr is to re-encode your media in-place, which means it
integrates seamlessly into most/any media stacks (although I have had some
issues with Jellyfin losing metadata).

There are a number of ways to process media in Tdarr. You set up a library,
which regularly scans a folder (optionally watched) for new media. This library
can produce output in-place or into an output folder, and each library has some
set transcoding rules. Those rules can be very simple (run an `ffmpeg` command),
or complex (run some conditional flow). This is mine:

<img src="/images/blog/tdarr/tdarrflow.png" alt="My current Tdarr flow"
style="width: 100%" />

I have [another program](https://www.bazarr.media/) that grabs subtitles for me,
so my priority here is that Jellyfin can direct play everything on the server.
That means stereo AAC audio, low-bitrate x264 video, all wrapped in an MKV. I
don't want to do any unnecessary processing though, hence the conditionals. The
MKVPropEdit calls are to make sure I am dealing with accurate metadata
(primarily bitrate info) both before and after a transcode.

## Technical deets

For those interested,

The plugin that runs the remux to MKV is
`Community:Tdarr_Plugin_00td_action_remux_container`.

Converting audio is done with:

```
Community:Tdarr_Plugin_00td_action_handbrake_ffmpeg_custom

cli: ffmpeg
arguments: <io> -map 0:v -map 0:a -map 0:s? -map 0:d? -c:v copy -c:a aac -ac
2 -b:a 128k -c:s copy -c:d copy
container: mkv
```

Where the relevant arguments are `-c:a aac -ac 2 -b:a 128k` which specify the
codec, channel count, and bitrate respectively.

Converting video is done with:

```
Community:Tdarr_Plugin_00td_action_handbrake_ffmpeg_custom

cli: ffmpeg
arguments: <io> -map 0
-c:v libx264 -preset veryfast -b:v 2M -c:a copy -c:s copy -c:d copy
2 -b:a 128k -c:s copy -c:d copy
container: mkv
```

Where the relevant arguments are `-c:v libx264 -preset veryfast -b:v 2M` which
specify the codec, transcoding preset (speed to compression efficiency ratio),
and bitrate respectively.

Now to wait 16 days for my whole library to be churned through.
