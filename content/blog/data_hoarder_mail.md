---
title: "A data hoarder's guide to mail and calendars"
date: 2024-09-28T16:41:26+01:00
draft: true
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
