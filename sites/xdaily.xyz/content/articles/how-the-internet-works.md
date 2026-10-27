---
title: "How the Internet Works: Packets, IP Addresses, Routers, DNS and the Cables Under the Sea"
description: "What happens when you open a web page: how data is split into packets, how IP addresses and routers find the way, what DNS and HTTPS do, and the undersea cables and data centers behind it all."
category: how-things-work
date: 2026-10-26
order: 4
---
Every time you send a message, watch a video or open a web page, data travels across the world in a fraction of a second. A photo you share may pass through dozens of computers, cross oceans on cables lying on the seafloor and arrive on a friend's phone on another continent before you have put your own phone down. The internet seems like a cloud floating in the air, but it is actually a vast physical network of cables, radio links, routers and data centers, held together by a set of shared rules called protocols. This explainer follows your data on its journey and explains the key ideas that make the internet work.

## A network of networks

The internet is not owned by a single company or government. It is a **network of networks**: tens of thousands of independent networks, run by internet service providers, universities, companies and governments, that agree to connect and exchange data using common rules.

The internet grew out of research projects in the late 1960s, especially ARPANET, funded by the U.S. Department of Defense. In the 1970s, Vint Cerf and Bob Kahn designed the **TCP/IP** protocols that allow different networks to communicate. In 1989, Tim Berners-Lee, working at CERN in Switzerland, invented the **World Wide Web**, a system of linked pages accessed through the internet. The web and the internet are often confused: the web is one service that runs on the internet, alongside email, messaging, video calls, online games and many others.

## Data travels in packets

When you send data over the internet, it is not sent as one continuous stream. It is broken into small pieces called **packets**. A typical packet contains up to about 1,500 bytes of data, plus a header with information such as where it came from, where it is going and how it fits with other packets.

Breaking data into packets has big advantages:

- **Efficiency:** Many users can share the same cables and routers, because packets from different conversations are mixed together.
- **Resilience:** If one path is blocked or broken, packets can take another route.
- **Reliability:** If a packet is lost, only that packet needs to be resent.

This approach is called **packet switching**. It is different from the old telephone network, which reserved a dedicated circuit for each call.

## IP addresses: the internet's postal system

Every device connected to the internet needs an address so that packets can find it. This is the **IP address**, for Internet Protocol.

- **IPv4** addresses look like four numbers separated by dots, such as 192.0.2.44. There are about 4.3 billion possible IPv4 addresses, which is not enough for all the world's devices.
- **IPv6** addresses are much longer, written in hexadecimal, such as 2001:db8::8a2e:370:7334. IPv6 provides about 340 undecillion addresses, a number with 39 digits, enough for every device imaginable.

Most home networks use a technique called **network address translation (NAT)**, which lets many devices share one public IPv4 address. Your router keeps track of which internal device each conversation belongs to.

## Routers: finding the way

**Routers** are specialized computers that forward packets toward their destination. When a packet arrives, a router reads its destination address and decides where to send it next, based on a routing table. Each router only needs to know the next step, not the entire route. A packet may pass through 10 to 30 routers on its way across the world.

Large networks exchange information about which addresses they can reach using a protocol called the **Border Gateway Protocol (BGP)**. This allows the internet's routes to adjust automatically when connections fail or new ones appear.

## TCP and UDP: reliable and fast delivery

The Internet Protocol only tries to deliver packets; it does not guarantee that they arrive or arrive in order. Other protocols handle this.

- **TCP (Transmission Control Protocol)** makes sure all packets arrive, in the right order, without errors. If a packet is missing, TCP asks for it again. It is used for web pages, email and file downloads.
- **UDP (User Datagram Protocol)** sends packets without checking that they arrive. It is faster and used for real-time applications like video calls, online games and live streaming, where a small loss is better than a delay.

Newer protocols like **QUIC**, used by many websites today, combine the reliability of TCP with the speed of UDP.

## DNS: the internet's phone book

People remember names like example.com, but computers use IP addresses. The **Domain Name System (DNS)** translates domain names into IP addresses.

When you type a website's name:

1. Your device asks a **DNS resolver**, usually run by your internet provider or a public service.
2. If the resolver does not already know the answer, it asks a **root server**, which points it to the server responsible for the top-level domain, such as .com or .org.
3. That server points to the **authoritative server** for the specific domain.
4. The authoritative server returns the IP address.
5. The resolver gives the address to your device and remembers it for a while, a process called caching.

All of this usually happens in a few milliseconds.

## What happens when you open a web page

Putting it together, here is a simplified version of what happens when you type a web address and press enter:

1. Your browser uses DNS to find the IP address of the website's server.
2. It opens a connection to the server, usually using HTTPS.
3. It sends an **HTTP request**, asking for the page.
4. The server sends back the page's HTML code, along with instructions for loading images, styles and scripts.
5. Your browser requests those additional files, often from several servers.
6. The browser assembles everything and displays the page.

## HTTPS and encryption

When you see a padlock in your browser's address bar, the connection uses **HTTPS**, which encrypts data between your device and the website using a protocol called TLS. Encryption scrambles the data so that anyone intercepting it along the way, for example on public Wi-Fi, cannot read it.

HTTPS also uses **digital certificates** to verify that you are connected to the real website and not an impostor. A certificate is issued by a trusted certificate authority, which confirms that the website controls its domain name. Today, the vast majority of web traffic uses HTTPS.

## The physical internet

Despite the image of a cloud, the internet is very physical.

### Undersea cables

About 99 percent of intercontinental internet traffic travels through **undersea fiber-optic cables** lying on the ocean floor. There are hundreds of such cables, together more than 870,000 miles (1.4 million kilometers) long. They carry data as pulses of light through glass fibers thinner than a human hair. In deep water, the cables are about the thickness of a garden hose; near the shore, they are armored to protect them from anchors and fishing nets.

### Fiber, copper and wireless

On land, data travels through fiber-optic cables, older copper telephone and cable TV lines, and wireless links. The final connection to homes may be fiber, DSL over telephone lines, cable, mobile networks like 4G and 5G, or satellite. Inside the home, Wi-Fi uses radio waves to connect devices to the router.

### Data centers and content delivery networks

Websites and online services run on servers housed in **data centers**, large buildings filled with computers, storage and cooling systems. To make content load faster, companies use **content delivery networks (CDNs)**, which store copies of popular content in data centers close to users around the world. When you stream a video, it often comes from a server in your own region rather than from the other side of the planet.

### Internet exchange points

Networks connect to each other at **internet exchange points**, buildings where many networks meet and exchange traffic directly. This keeps data flowing efficiently between providers.

## How fast is the internet?

Light travels through fiber at about two-thirds of its speed in a vacuum, roughly 124,000 miles (200,000 kilometers) per second. A packet crossing the Atlantic Ocean takes about 30 to 40 milliseconds. The delay between sending a request and receiving a response is called **latency**. Bandwidth, measured in megabits or gigabits per second, describes how much data can be sent per second.

## Questions readers ask

**Is the internet the same as the web?**
No. The internet is the global network of connected computers. The web is a service that uses the internet to share linked pages.

**Who owns the internet?**
No single entity. It is made of thousands of independently operated networks that cooperate using shared standards.

**What is an IP address?**
A numerical address that identifies a device on the internet so that data can be sent to it.

**What does DNS do?**
It translates human-friendly domain names into IP addresses that computers use to find each other.

**How does data cross oceans?**
Mostly through undersea fiber-optic cables, which carry pulses of light across the seafloor between continents.

## In short

The internet is a global network of networks that sends data as small packets. IP addresses identify devices, routers forward packets step by step toward their destinations, and protocols like TCP and UDP manage delivery. DNS translates names into addresses, and HTTPS encrypts data to keep it private and authentic. Underneath it all lies a physical infrastructure of fiber-optic cables, undersea links, wireless networks, data centers and exchange points. Every message and video you send is a small journey through this remarkable system.
