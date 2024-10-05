---
title: "A data hoarder's guide to mail and calendars"
date: 2024-09-28T16:41:26+01:00
draft: false
---

I'm a self admitted data hoarder. If it's useless, hidden behind a confusing
mess of directories, and will take an age to sort through, I'm storing it on a
giant hard drive. I was inspired by [Luke Smith's video on
neomutt](https://www.youtube.com/watch?v=2U3vRbF7v5A) to take my mail offline,
which lead into a deep dark rabbit hole that I never really returned from.

<!--more-->

I'd say my setup is getting pretty good, and guided by a few key
philosophies.

1. **Offline is better.** This isn't to say that you can't relentlessly sync
   devices, but having a full backup of your mailbox, calendars, contacts,
   whatever is safer and means you can access them while you might be out of
   internet.
2. **Old, standardized, and well supported.** Decide how you want to store this
   stuff. Preferably in a format that is to some extent human readable, open
   source, and that you could parse yourself in an emergency, then find apps that
   can read it.
3. **Lightweight and powerful.** This goes for both the files, and the programs
   that read them. I prefer terminal-based applications where possible (of
   course).

{{<toc>}}

## Teaching an old dog new tricks

[NeoMutt](https://github.com/neomutt/neomutt) is a collection of patches against
(and spiritual successor to) archaic, terminal-based email client
[mutt](www.mutt.org). Mutt is notoriously hard to configure and learn. It does
not come with sensible defaults and handy keybindings like all your newfangled
python-based emoji-packed so-called terminal apps. This is a program that a guy
who can code in FORTRAN would use. In any case, I'm a big Gen-Z baby so I
configured by NeoMutt with training wheels in the form of
[mutt-wizard](https://github.com/LukeSmithxyz/mutt-wizard)
(not-so-coincidentally created by Luke Smith). Mutt-wizard configures isync for
you to periodically synchronize your mail with an IMAP server of your choosing.

The wizard is awesome but it covers the vast majority of cases only, and I ran
into some issues with my university email. The first was that I had 2FA enabled,
and so couldn't use plain password authentication with isync. "APP PASSWORDS!" I
hear you scream, and that was golden for about 2 years until they decided to
switch off plain authentication altogether. I was forced try and make
[OAuth](https://en.wikipedia.org/wiki/OAuth) work. Thankfully isync comes with
OAuth support, but is unable to grab a token. There are a few helper programs to
make this happen, but for some reason the only one that worked for me was
[mutt_oauth2.py](https://gitlab.com/muttmua/mutt/-/blob/master/contrib/mutt_oauth2.py).
My isync config ended up looking like this:

```config
...
IMAPStore uni-remote
Host outlook.office365.com
Port 993
User [email-here]
PassCmd "$HOME/.config/mutt/mutt_oauth2.py $HOME/.config/mutt/oauth_token"
AuthMechs XOAUTH2
SSLType IMAPS
CertificateFile /etc/ssl/certs/ca-certificates.crt
...
```

The second issue I faced was that I didn't know anyone's university email by
heart. mutt-wizard comes with a local-only address book, but that wouldn't help
me email people I might never have had contact with before. Outlook stores its
address book in an LDAP directory, so by using [mutt-ldap-query](https://github.com/foxxx0/mutt-ldap-query) and setting:

```config
set query_command = "mutt-ldap-query '%s'"
```

in your mutt config, you can search an outlook address book for tab completion
when writing a new mail.

This is what my `~/.config/mutt-ldap-query/config.yml` looks like:

```config
:host: 127.0.0.1
:port: 1389
:base: ou=people
:auth:
  :method: :simple
  :username: [email here]
  :password: [password here]
```

## Daenarys, more like khal-is-easy

[khal](https://github.com/pimutils/khal) is my terminal-based calendar program.
It's admittedly a bit clunky compared to traditional calendar programs, but it
is very responsive and avoids me having to use a web interface. Plus, of course,
I can use my calendars offline. I use khal with
[vdirsyncer](https://github.com/pimutils/vdirsyncer) and a private Nextcloud
installation (which hosts a [CalDAV](https://en.wikipedia.org/wiki/CalDAV)
server) to keep my calendars in sync.

The first step is to install and configure vdirsyncer. My config looks like:

```config
[general]
status_path="~/.vdirsyncer/status/"

[pair nc]
a = "nc_local"
b = "nc_remote"
collections = ["from a", "from b"]

[storage nc_local]
type = "filesystem"
path = "/home/hex/.calendars/nc"
fileext = ".ics"

[storage nc_remote]
type = "caldav"
url = "https://nc.hexn.live/remote.php/dav/calendars/admin"
username = "admin"
password.fetch = ["command", "pass", "app_nextcloud"]
```

It's pretty standard. It's worth noting that I avoid storing my Nextcloud app
password in a config file by instead encrypting it with pass and getting
vdirsyncer to pull it when needed. My GPG key is password protected but I use [a
GPG agent which is unlocked at login](https://github.com/cruegge/pam-gnupg) to
bypass interactive authentication so vdirsyncer can be run automatically as a
cron job. Run `vdirsyncer discover` and then `vdirsyncer sync` and then setup
khal similarly:

```config
[calendars]

[[personal]]
path = /home/hex/.calendars/nc/personal
type = calendar

[locale]
timeformat = %H:%M
dateformat = %d/%m/%Y
longdateformat = %d/%m/%Y
datetimeformat = %d/%m/%Y %H:%M
longdatetimeformat = %d/%m/%Y %H:%M

[default]
default_calendar = personal
```

And everything should work (fingers crossed).

## Periodic sync isn't good enough

Everything was initially setup so that synchronisation jobs were run by cron, at
regular intervals (pretty regularly on machines that were plugged into the
mains, and less so with batteries). I'm actually quite happy with this for
sending me mail and calendar notifications, I don't often care about receiving
an email 30m after it was actually sent. The only thing that bothered me was the
idea that I might edit calendars or move mail, and then shut down my PC without
synchronising, maybe leaving those changes untracked for weeks. This was, by
far, the slipperiest problem to solve here, but finally I came up with this:

```bash
$ which mutt
mutt () {
 nohup bash -c "sleep 1
    while ps -a | grep neomutt; do
      sleep 1
    done
    if ping -c 1 1.1.1.1; then
      notify-send -t 2000 'Syncing mail'
      mailsync || notify-send -u critical 'There was some issue while syncing mail. Try to sync manually.'
      notify-send -t 2000 'Mail synced'
    else
      notify-send -u critical 'No internet connection. Make sure to sync mail manually.'
    fi" &> /dev/null &
 neomutt
}
```

This ugly little script is how I make sure that my mail (in this case, there is
an almost identical one for khal) is synced with the remote server whenever I
close mutt, no matter how I do so.

Firstly, `nohup` makes sure that the script runs in the background and is
disconnected from the terminal, so that if I close the window, the mail will be
synchronised regardless. Secondly, we wait for the neomutt process to finish,
then we ping 1.1.1.1 to make sure we are online. Finally, if we are, we run `mailsync`
(which is packaged with mutt-wizard). This function is registered in my `.zshrc`
and replaces mutt. It has worked perfectly for me so far.

I'm still working on a way to sync contacts from my CardDAV server, and
hopefully be able to query them from mutt, so that I can maintain just a single
address book (dreamy, I know).

*[Update 2024-10-05]*

[khard](https://github.com/lucc/khard) is the way to get contacts working.
Writing this kind of inspired me to take another look, and now I have mutt
running, my phone, and my Nextcloud instance all sharing one address book.

khard is easy to use, pretty self explanatory (and works with vdirsyncer like
khal). Here is the alias I use to make it slightly more convenient:

```bash
khard() {
  if [[ "$1" == "edit" ]]; then
    command khard edit $(command khard list --parsable | fzf -d '\t' --with-nth 2 | cut -f 1)
    vdirsyncer sync nc_con
  else
    command khard show $(command khard list --parsable | fzf -d '\t' --with-nth 2 | cut -f 1)
  fi
}
```

And then stick this in your `~/.config/mutt/muttrc`

```config
macro index,pager a "<pipe-message>command khard add-email && vdirsyncer sync nc_con<return>" "add the sender address to khard"
set query_command="echo %s | xargs khard email --parsable --"
```

And all should be well.
