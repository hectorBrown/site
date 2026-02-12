---
title: "Learning preseed"
date: 2026-02-12T11:50:49+11:00
draft: false
---

Or, how to install an OS from across the globe without a [20,037.509
km](https://en.wikipedia.org/wiki/Earth%27s_circumference) USB lead.

<!--more-->

{{<toc>}}

## What is a preseed?

A `preseed.cfg` is a file used to automatically answer out a Debian installer's
questions during installation, as fast as it can answer them. This allows me to
get my parents to install my system on a new
[N150](https://www.intel.com/content/www/us/en/products/sku/241636/intel-processor-n150-6m-cache-up-to-3-60-ghz/specifications.html)
NUC I bought back in the UK without me being physically close to my system (what
would have otherwise been a long and frustrating process, the weapons in our
arsenal being a low-res video call and the USB port on a Raspberry Pi I have SSH
access to).

## Better late than never

Most of the `preseed.cfg` I used is very standard, and can be found
[here](https://www.debian.org/releases/stable/example-preseed.txt), or my
specific version can be found [here](./preseed.cfg). The interesting part,
anyway, is the late command section, which is where I do all the custom
configuration that lets me SSH into the server after the installation is done.

We do first have to grab the correct packages...

```
# --- Package Selection ---
tasksel tasksel/first multiselect standard
d-i pkgsel/include string openssh-server wireguard wireguard-tools curl wget
d-i pkgsel/upgrade select full-upgrade
```

And then we do a few things to set up the system for remote access.

```
# --- The "Late Command" (Post-Install Customization) ---
d-i preseed/late_command string \
    in-target mkdir -p /home/hex/.ssh; \
    in-target wget -O /home/hex/.ssh/authorized_keys https://hexn.live/ssh.txt; \
    in-target chown -R hex:hex /home/hex/.ssh; \
    in-target chmod 700 /home/hex/.ssh; \
    in-target chmod 600 /home/hex/.ssh/authorized_keys; \
    in-target systemctl enable ssh; \
    in-target /bin/sh -c "echo 'AllowUsers hex' >> /etc/ssh/sshd_config"
    mkdir -p /target/etc/wireguard; \
    cp /cdrom/custom/wg0.conf /target/etc/wireguard/wg0.conf; \
    in-target chmod 600 /etc/wireguard/wg0.conf; \
    in-target systemctl enable wg-quick@wg0; \

# --- Finished ---
d-i finish-install/reboot_directly boolean true
```

In these lines we first create a `.ssh` config directory, and then download my
public SSH key from this site, to add it to the `authorized_keys` section of the
file. We then make sure the permissions are correct on that folder, and enable
the SSH service so that it starts on boot. Finally we explicitly allow logins
for my user account.

For Wireguard, I embedded a `wg0.conf` file directly into the installation
`.iso`, since it contains a private key that I couldn't share publicly. We copy
that file from the ISO (`/cdrom`) to the system (`/target`), set its
permissions, and enable the Wireguard service.

Extracting an ISO is easy with `bsdtar -xf image.iso`, and I created a
`build.sh` with `xorriso` to embed my data, (and preseed) into the image:

```sh
xorriso -as mkisofs \
 -r -V "DEBIAN_AUTO" \
 -o custom-debian-auto.iso \
 -J -joliet-long -cache-inodes \
 -isohybrid-mbr /usr/lib/syslinux/bios/isohdpfx.bin \
 -b isolinux/isolinux.bin \
 -c isolinux/boot.cat \
 -boot-load-size 4 -boot-info-table -no-emul-boot \
 -eltorito-alt-boot \
 -e boot/grub/efi.img \
 -no-emul-boot -isohybrid-gpt-basdat \
 iso-source/
```

In the end your `iso-source/` should have a structure like this:

```zsh
 $ tree iso-source
iso-source
├── boot
│ ...
├── css
│ ...
├── custom
│   └── wg0.conf
├── debian -> .
├── dists
│ ...
│ ...
│ ...
├── preseed.cfg
├── README.html
├── README.mirrors.html
├── README.mirrors.txt
├── README.source
└── README.txt

473 directories, 1052 files
```

## The result

I was amazed that it actually worked to be honest. Nothing like the feeling of
seeing installation screens flash by unassisted, the screen go black, and then a
user prompt appear. Being able to SSH in over my VPN was an even bigger
surprise. The immediate steps post-installation were to change every password,
and rotate the Wireguard keys, since them being embedded in the ISO is a
security risk. In future I might have the system generate its own keys, and then
send the public key to an endpoint where I can approve it being added to the
network manually.

The logical next step is also to use something like
[Ansible](https://github.com/ansible/ansible) to setup the system, rotate the
keys, and setup firewalls, docker, etc. for me automatically. At that point,
setting up a new node for the network would be almost entirely hands-off, and I
could immediately start deploying images.
