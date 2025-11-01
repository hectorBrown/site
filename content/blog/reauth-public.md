---
title: "Forcing re-authentication on public WiFi"
date: 2025-11-01T13:27:13+11:00
draft: false
---

I've been playing around with (captive portal) public WiFi networks, and needed
to force re-authentication in order to do some testing. Here's how I did it.

<!--more-->

Public WiFi networks are surprisingly good at remembering you once you've
authenticated once. Great for most people, annoying for me. This is what i
worked out:

```shell
#!/bin/bash
INTERFACE=$1
SSID=$2
nmcli connection delete "$SSID" || exit 1
nmcli radio wifi off
sudo ip link set "$INTERFACE" down || exit 1
sudo macchanger -r "$INTERFACE" || exit 1
nmcli radio wifi on
sudo ip link set "$INTERFACE" up
while [[ $(nmcli dev wifi list | wc -l) -eq 1 ]]; do
 sleep 0.5
done
nmcli dev wifi connect "$SSID"
sudo dhclient -r "$INTERFACE" || exit 1
while ping -c 1 1.1.1.1 2>&1 | grep -q 'Network is unreachable'; do
 sleep 0.5
done
```

This script relies on `macchanger`, and `dhclient`, as well as you using
`NetworkManager`. It forgets your previous connection, then generates a random
MAC address for your interface, before reconnecting to the WiFi network. It then
refreshes the DHCP lease to get a new IP address. This seems to be enough to
re-trigger the captive portal login page.

I've only tested this on Sydney City library public WiFi, and I'm not sure
whether simply refreshing MAC or DHCP would be enough for another network, or
whether more steps would be needed.
