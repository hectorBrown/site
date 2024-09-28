---
title: "The perils of CGNAT"
date: 2024-09-28T10:44:14+01:00
draft: true
---

[IPv4 address exhaustion](https://en.wikipedia.org/wiki/IPv4_address_exhaustion)
is coming for all of us. If you live in a block of flats, terraced housing,
anarchist commune, or any type of high-density accommodation you might find that
you share a public IPv4 with your neighbours. This can make hosting your own
server difficult, but not impossible.

<!--more-->

{{<toc>}}

## NATty or not

Traditionally your packets go through NAT (network address translation) once on
their way to the internet.
![Diagram of traditional single NAT](/images/blog/cgnat/nat.png#center)
The packages emerge from a device in your private home network, with their
source IP set to a private address. Your router then translates that source
address to your public address, which can be used by whatever service your
accessing to reply to you. On receiving that reply, your router translates the
destination address back to your private IP and so 2-way communication is
possible.

If you are hosting a server, this setup also works, as long as you forward a
specific port to your server. This means that all traffic addressed to your
public IP port 443 (for example) is automatically sent to your server, meaning
you can accept incoming connections too.

CGNAT (carrier grade NAT) does this twice, so your modem is also part of a private network where its
peers are the modems of your neighbours. These addresses are then translated
again to a public IP that is shared by your whole building.
![Diagram of CGNAT](/images/blog/cgnat/cgnat.png#center)
This setup works fine for normal activity - outgoing connections - since the NAT
router maintains a list of connections and dynamically allocates ports to your
modem IP so that you can accept traffic from Netflix, Instagram, whoever.

If you want to host a server, though, it's a different story. You have no
ability to forward a specific port to your network (like 443 for HTTPS), or
even to claim a random port as your own for any length of time. Effectively this
renders your public IP useless for this kind of activity.

Despite this, this very website was hosted on a server that sat behind a CGNAT
table for the best part of 2 years, and functioned without issue. How, you may
ask, could that be possible? The answer lies in VPNs and VPSs.

## Wireguard, more like FIREguard

The first issue is access to a dedicated public IPv4. For this I rent a very
cheap low-power VPS (virtual private server) from
[IONOS](https://www.ionos.com/servers/vps) (the VPS Linux XS for $2/mo, has
worked great for me - no complaints). The server is weak and weedy, but comes
with that oh-so-precious public IPv4 address and enough power to handle routing
packets for me. That server acts as a router for my VPN, which includes (most
importantly) both of my servers, and some client devices.
![Diagram of my personal server setup](/images/blog/cgnat/mysetup.png#center)
When an incoming, let's say HTTPS, packet enters my VPS, it is forwarded to the
server over the VPN, and appears to be local traffic. The server replies over
the VPN again, the packet is translated by the VPS and returned to the client.
This allows my setup to act like a single NAT, regardless of where the servers
are.

Getting a VPS to act like a router takes a little bit of setup. Here's my
iptables configuration:

```bash
hex@my-vps:~$ sudo iptables -t nat -L -n
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination
DNAT       6    --  0.0.0.0/0            194.164.121.226      tcp dpt:80 to:172.16.0.4:8080
DNAT       6    --  0.0.0.0/0            194.164.121.226      tcp dpt:443 to:172.16.0.4:8081

Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
MASQUERADE  0    --  172.16.0.4           0.0.0.0/0
```

I find that the best place to put these rules is in your wireguard config, so
that they are automatically added once your VPN goes live:

```config
PostUp = iptables -t nat -A PREROUTING -i ens6 -p tcp -d 194.164.121.226 --dport 80 -j DNAT --to-destination 172.16.0.4:8080
PostUp = iptables -t nat -A PREROUTING -i ens6 -p tcp -d 194.164.121.226 --dport 443 -j DNAT --to-destination 172.16.0.4:8081
PostUp = sudo iptables -t nat -A POSTROUTING -o ens6 -s 172.16.0.4 -j MASQUERADE
PreDown = iptables -t nat -D PREROUTING -i ens6 -p tcp -d 194.164.121.226 --dport 80 -j DNAT --to-destination 172.16.0.4:8080
PreDown = iptables -t nat -D PREROUTING -i ens6 -p tcp -d 194.164.121.226 --dport 443 -j DNAT --to-destination 172.16.0.4:8081
PreDown = sudo iptables -t nat -D POSTROUTING -o ens6 -s 172.16.0.4 -j MASQUERADE
```

Obviously in this setup, I only forward ports 80 and 443, but it would work for
any. Of course I'd also recommend setting up a general firewall, like ufw, to
block any traffic you aren't expecting.

This setup has a litany of other benefits, like allowing me to securely
administer these servers remotely, and safely expose
[NFS](https://en.wikipedia.org/wiki/Network_File_System) shares that can be
accessed over the internet.

### An incoming packet is an incoming packet is an incoming packet

You might be rightfully sceptical of this setup. You might say something like,
"But Hector, regardless of how you might want to abstract the problem, you're
fundamentally still asking your server to accept an incoming packet from a
client. How does your VPS initiate a connection with your server when it wants
to send it a packet? What the heck is going on?" You'd be right. Although this
setup looks very clean from a high-level, it harbours a terrible secret. In
order to bypass CGNAT, a connection between the VPS and the server must be
constantly pinned open. This is a feature known as
[persistent keep-alive](https://en.wikipedia.org/wiki/HTTP_persistent_connection)
where my server sends a packet to my VPS ever 25 seconds in order to keep a
CGNAT port open and forwarding to me, and to let the VPS know which one it is.
This was no problem in my experience, the traffic is negligible. Some ISPs
though, might not like that you are hosting a server despite everything they've
done to stop you and could block connections made in this way, but there's only
one way to find out.

Here's how you'd set that up with wireguard:

```config
[Interface]
PrivateKey = [Your private key]
Address = 172.16.0.5/24

[Peer]
PublicKey = [Your public key]
AllowedIPs = 172.16.0.0/24
EndPoint = 194.164.121.226:51820
PersistentKeepAlive = 25
```
