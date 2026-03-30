# 🌐 Networking Basics — Complete Guide

Networking is the backbone of every cyberattack and every defense. Every threat you investigate, every alert you triage, and every control you deploy operates over a network. This guide covers all the core networking concepts you need to know as a security professional.
{ .page-lead }

!!! note "Interview answer"
    *"A computer network is a group of interconnected devices that communicate using agreed protocols to share data and resources. In cybersecurity, networking knowledge is essential because attacks, detections, and defenses all depend on how devices communicate — understanding the network is prerequisite to understanding the threat."*

---

## What Is a Computer Network?

A computer network connects devices so they can exchange data and share resources. Every network has three essential components:

- **Nodes** — devices that send or receive data (computers, servers, phones, IoT devices, printers)
- **Links** — the medium connecting nodes (wired: Ethernet, fiber; wireless: Wi-Fi, Bluetooth, cellular)
- **Protocols** — agreed rules governing how data is formatted, transmitted, and acknowledged

When data is sent, it is broken into small **packets**. Each packet travels independently through the network, may take different paths, and is reassembled at the destination. This is called **packet switching** — the fundamental mechanism of the internet.

---

## Network Types by Size

| Type | Full Name | Scope | Example |
|------|-----------|-------|---------|
| **PAN** | Personal Area Network | A few meters — one person's devices | Bluetooth headset to phone |
| **LAN** | Local Area Network | A building or campus | Office floor network, home Wi-Fi |
| **MAN** | Metropolitan Area Network | City-scale | City-wide fiber connecting colleges |
| **WAN** | Wide Area Network | Country or global | Corporate offices linked across countries |
| **Internet** | Interconnected Networks | Global | The global public internet |
| **Intranet** | Private internal internet | Organization-wide | Company's internal web portals |
| **Extranet** | Controlled external access | Partners/vendors | Supplier accessing a company's order system |

---

## Network Architectures

### Client-Server Architecture
The most common model in enterprise environments. **Servers** provide services and resources; **clients** request them.

- Centralized management, authentication, and access control
- Examples: Active Directory domain, company email server, database server
- Security implications: compromising a server impacts all its clients

### Peer-to-Peer (P2P) Architecture
Every device acts as both client and server — no central authority.

- Decentralized and resilient
- Harder to secure because there is no central enforcement point
- Examples: BitTorrent, blockchain networks
- Security risk: often abused for malware distribution and botnet C2

---

## Network Devices

### Router
Connects **different networks** and routes traffic between them using IP addresses.

- Operates at Layer 3 (Network layer)
- Maintains a routing table of known network paths
- Performs NAT (Network Address Translation) for home/office networks
- **Security role**: enforces ACLs, implements routing policies, first line of perimeter control

### Switch
Connects devices **within the same network** and forwards traffic using MAC addresses.

- Operates at Layer 2 (Data Link layer)
- Learns MAC addresses and builds a MAC address table (CAM table)
- Sends frames only to the intended port — more efficient and secure than a hub
- **Security role**: implements VLANs, port security, 802.1X authentication

**Switch security attacks:**
- **MAC flooding**: fills the CAM table, forces switch to broadcast like a hub → eavesdropping
- **VLAN hopping**: double-tagging exploit to access unauthorized VLANs

### Hub
Connects devices within a network but broadcasts all traffic to every port.

- Operates at Layer 1 (Physical layer)
- **No intelligence** — cannot filter or direct traffic
- A security hazard: any connected device sees all traffic (passive sniffing)
- Largely obsolete — replaced by switches

### Bridge
Connects two network segments and filters traffic between them using MAC addresses.

- Operates at Layer 2
- Reduces unnecessary traffic by only forwarding frames whose destination is on the other segment
- Predecessor to modern switches

### Gateway
Connects networks using **different protocols** and translates between them.

- Operates at all layers (Layer 3 to Layer 7)
- Example: connecting a corporate IPv4 LAN to an IPv6 ISP
- Email gateways, API gateways, and security gateways act as policy enforcement points

### Access Point (AP)
Provides **wireless connectivity** by extending a wired network to Wi-Fi devices.

- Operates at Layer 2
- Creates wireless coverage areas (cells)
- **Security role**: enforces WPA2/WPA3 encryption, implements MAC filtering, 802.1X RADIUS auth
- **Security risk**: Rogue Access Points, Evil Twin attacks, weak WPA2 passphrase attacks

### Modem
Converts digital signals (from your computer) to analog signals (for transmission over phone lines or cable) and back.

- Bridges your home/office network to your ISP
- The word "modem" = **mod**ulator-**dem**odulator
- Home networks: router and modem often combined in one device

### Repeater
Amplifies and regenerates a signal to extend the range of a network.

- Operates at Layer 1
- Does not filter or process traffic — just boosts the signal
- Used in long cable runs or Wi-Fi range extension

### Firewall
Monitors and controls network traffic based on predefined security rules.

- Operates at Layer 3–7 depending on type
- **Packet filtering**: inspects headers (IP, port, protocol)
- **Stateful inspection**: tracks connection state
- **Next-Gen Firewall (NGFW)**: application awareness, deep packet inspection, IPS
- **Deny** = silent drop | **Reject** = active refusal | **Allow** = forward

### Load Balancer
Distributes incoming traffic across multiple servers to prevent overload.

- Operates at Layer 4 (TCP) or Layer 7 (HTTP)
- Improves availability and performance
- **Security role**: hides backend server IPs, can terminate TLS, absorbs some DDoS traffic

---

## Transmission Media

### Wired Media

| Medium | Speed | Max Distance | Security Notes |
|--------|-------|-------------|---------------|
| **Twisted Pair (Cat5e/Cat6)** | 1–10 Gbps | 100 meters | Can be tapped if physical access is gained |
| **Coaxial Cable** | Up to 10 Gbps | Varies | Legacy; cable internet uses this |
| **Fiber Optic** | 10–400+ Gbps | Kilometers | Very hard to tap without detection; immune to EMI |

### Wireless Media

| Medium | Standard | Security Notes |
|--------|----------|---------------|
| **Wi-Fi** | 802.11a/b/g/n/ac/ax | WPA2/WPA3 — always use WPA3 where possible |
| **Bluetooth** | BT 4.0–5.3 | Bluejacking, Bluesnarfing attacks exist |
| **Cellular (4G/5G)** | LTE, NR | Generally secure; SS7 vulnerabilities exist |
| **NFC** | ISO 14443 | Relay attacks are possible at close range |
| **Infrared** | IrDA | Line-of-sight only; very limited range |

---

## Network Topologies

| Topology | Description | Advantages | Disadvantages |
|----------|-------------|-----------|---------------|
| **Bus** | All devices share one cable | Simple, cheap | One break affects all; hard to troubleshoot |
| **Star** | All devices connect to a central hub/switch | Easy to manage; one device failure isolated | Central point of failure |
| **Ring** | Devices connected in a loop | Predictable performance | One break stops all traffic |
| **Mesh** | Every device connects to every other | Highly redundant and resilient | Expensive and complex |
| **Tree** | Hierarchical — parent-child structure | Scalable | Root failure cascades down |
| **Hybrid** | Combination of multiple topologies | Flexible | Complex to design and secure |

Most enterprise networks use a **hierarchical star** topology — access layer switches → distribution layer switches → core layer switches, with redundant links for resilience.

---

## IP Addressing

### IPv4

- 32-bit address written in four octets: `192.168.1.100`
- Provides approximately 4.3 billion unique addresses
- **Public IP**: globally routable — assigned by your ISP
- **Private IP**: not globally routable — used inside networks (NAT translates them)

**Private IPv4 ranges (RFC 1918):**

| Range | CIDR | Common Use |
|-------|------|-----------|
| `10.0.0.0 – 10.255.255.255` | /8 | Large enterprises |
| `172.16.0.0 – 172.31.255.255` | /12 | Medium networks |
| `192.168.0.0 – 192.168.255.255` | /16 | Home and small office |
| `127.0.0.0 – 127.255.255.255` | /8 | Loopback (localhost only) |
| `169.254.0.0 – 169.254.255.255` | /16 | Link-local (APIPA — no DHCP) |

### IPv6

- 128-bit address written in hexadecimal groups: `2001:0db8:85a3::8a2e:0370:7334`
- Provides 340 undecillion unique addresses — effectively unlimited
- No NAT needed — every device can have a public address
- Built-in IPsec support (though optional in practice)
- **Security note**: IPv6 traffic may bypass IPv4-only security controls if dual-stack is enabled and not monitored

### Subnetting

Subnetting divides a network into smaller segments using a **subnet mask** or CIDR notation.

| CIDR | Subnet Mask | Usable Hosts | Example |
|------|------------|-------------|---------|
| /24 | 255.255.255.0 | 254 | Standard office subnet |
| /25 | 255.255.255.128 | 126 | Split a /24 in half |
| /30 | 255.255.255.252 | 2 | Point-to-point links |
| /32 | 255.255.255.255 | 1 | Single host route |

**Security benefit of subnetting**: network segmentation limits broadcast domains and reduces the blast radius of attacks. If an attacker compromises one subnet, they cannot automatically reach hosts on other subnets without passing through a router or firewall.

---

## Key Networking Protocols

### Application Layer Protocols

| Protocol | Port | Purpose | Security Note |
|----------|------|---------|--------------|
| **HTTP** | 80 | Web traffic (unencrypted) | Never use on its own — use HTTPS |
| **HTTPS** | 443 | Web traffic encrypted with TLS | Standard for all web communication |
| **FTP** | 21 | File transfer (plaintext) | Transmits passwords in clear — use SFTP |
| **SFTP** | 22 | Secure file transfer over SSH | Preferred over FTP |
| **SSH** | 22 | Secure remote CLI access | Critical to protect — disable password auth, use keys |
| **Telnet** | 23 | Remote CLI (plaintext) | Never use — transmits everything unencrypted |
| **SMTP** | 25/587 | Sending email | 587 with STARTTLS for submission |
| **IMAP** | 143/993 | Receiving email (server-sync) | 993 is IMAPS (encrypted) |
| **POP3** | 110/995 | Receiving email (download-delete) | 995 is POP3S (encrypted) |
| **DNS** | 53 | Domain name resolution | Target of cache poisoning, DNS hijacking |
| **DHCP** | 67/68 | Automatic IP assignment | DHCP starvation and rogue DHCP attacks exist |
| **SNMP** | 161/162 | Network device management | SNMPv1/v2 are insecure — use SNMPv3 |
| **NTP** | 123 | Time synchronization | Critical for log correlation; NTP amplification DDoS |
| **LDAP** | 389/636 | Directory queries | 636 is LDAPS (encrypted) |
| **RDP** | 3389 | Windows remote desktop | Frequently brute-forced — never expose to internet |
| **SMB** | 445 | Windows file sharing | Disable SMBv1 — exploited by EternalBlue/WannaCry |

### Transport Layer Protocols

#### TCP (Transmission Control Protocol)
- **Connection-oriented**: establishes a connection before sending data
- **Three-way handshake**: SYN → SYN-ACK → ACK
- **Reliable**: guarantees delivery, ordering, and error checking
- **Use cases**: HTTP, HTTPS, SSH, SMTP, FTP — anything requiring reliability

**TCP Header Key Fields:**
- Source/Destination Port, Sequence Number, Acknowledgment Number
- **Flags**: SYN, ACK, FIN, RST, PSH, URG
- **Window Size**: controls flow (how much data can be sent before acknowledgment)

**SYN Flood attack** exploits the three-way handshake by sending thousands of SYN packets without completing the handshake, exhausting the server's connection queue.

#### UDP (User Datagram Protocol)
- **Connectionless**: sends data without establishing a connection first
- **Unreliable**: no guarantee of delivery, no ordering, no retransmission
- **Faster**: no overhead of connection management
- **Use cases**: DNS, DHCP, NTP, VoIP, video streaming, online gaming

**UDP amplification attacks** spoof source IPs and send small UDP requests to open servers (DNS, NTP) — the large response is sent to the spoofed victim IP.

### Network Layer Protocols

| Protocol | Purpose | Security Note |
|----------|---------|--------------|
| **IP** | Logical addressing and routing | IP spoofing — forging source address |
| **ICMP** | Diagnostics — ping, traceroute | Ping of Death, ICMP tunneling, Smurf attack |
| **ARP** | Maps IP → MAC on local network | ARP poisoning/spoofing — redirect traffic to attacker |
| **OSPF** | Interior routing protocol | Route injection attacks if authentication not enabled |
| **BGP** | Inter-AS routing (internet backbone) | BGP hijacking — reroutes internet traffic |

---

## NAT — Network Address Translation

NAT allows multiple devices on a private network to share a single public IP address.

**How it works:**
1. Device at `192.168.1.10` sends a packet to `8.8.8.8:80`
2. The router changes the source IP from `192.168.1.10` to the public IP `203.0.113.5` and records the mapping in the NAT table
3. The server at `8.8.8.8` sees the request from `203.0.113.5` and replies to it
4. The router receives the reply and forwards it to the original `192.168.1.10`

**NAT Types:**
- **Static NAT**: one-to-one permanent mapping (server hosting a service)
- **Dynamic NAT**: pool of public IPs mapped on-demand
- **PAT (Port Address Translation)**: many private IPs share one public IP using different port numbers — most common (what your home router does)

---

## DNS — Domain Name System

DNS translates human-readable domain names into IP addresses.

**DNS Resolution process:**
1. Your browser asks: "What is the IP of `google.com`?"
2. Your OS checks the **local cache** and `/etc/hosts` first
3. If not found, queries the **recursive resolver** (usually your ISP's or `8.8.8.8`)
4. The resolver queries the **root nameserver** → gets referral to `.com` TLD server
5. The TLD server refers to Google's **authoritative nameserver**
6. The authoritative nameserver returns the IP address: `142.250.x.x`
7. The resolver caches the result (for the TTL duration) and returns it to you

**DNS Record Types:**

| Record | Purpose | Example |
|--------|---------|---------|
| **A** | Maps domain to IPv4 address | `google.com → 142.250.80.46` |
| **AAAA** | Maps domain to IPv6 address | `google.com → 2607:f8b0::200e` |
| **MX** | Mail server for the domain | `mail.google.com` |
| **CNAME** | Alias pointing to another hostname | `www.google.com → google.com` |
| **TXT** | Text records — used for SPF, DKIM, DMARC | `v=spf1 include:_spf.google.com ~all` |
| **NS** | Authoritative nameservers for the domain | `ns1.google.com` |
| **PTR** | Reverse lookup — IP to hostname | Used in email spam filtering |

**DNS Security attacks:**
- **DNS Cache Poisoning**: attacker poisons a resolver's cache with false records — redirects users
- **DNS Hijacking**: changing DNS settings on a device or router to point to malicious servers
- **DNS Tunneling**: encoding data in DNS queries to bypass firewalls (exfiltration, C2)
- **DNS Amplification DDoS**: small query → large response sent to spoofed victim IP

**DNS Security controls:**
- **DNSSEC**: digitally signs DNS records to prevent tampering and poisoning
- Use encrypted DNS: **DoH** (DNS over HTTPS, port 443) or **DoT** (DNS over TLS, port 853)

---

## DHCP — Dynamic Host Configuration Protocol

DHCP automatically assigns IP addresses and network configuration to devices when they join a network.

**DORA Process:**
1. **D**iscover — client broadcasts "I need an IP address"
2. **O**ffer — DHCP server responds with an available IP
3. **R**equest — client accepts the offer and requests that IP
4. **A**cknowledge — server confirms the lease is assigned

**DHCP provides:** IP address, subnet mask, default gateway, DNS server addresses, lease duration

**DHCP security attacks:**
- **DHCP Starvation**: attacker requests thousands of IPs, exhausting the address pool — legitimate devices get no IPs (DoS)
- **Rogue DHCP Server**: attacker runs their own DHCP server, assigns themselves as the default gateway and DNS server — full traffic interception
- **Mitigation**: DHCP Snooping on switches — only trusted ports can respond to DHCP requests

---

## Wireless Networking Security

### Wi-Fi Encryption Standards

| Standard | Status | Security | Notes |
|----------|--------|---------|-------|
| **WEP** | Broken — never use | ❌ | Cracked in seconds with Aircrack-ng |
| **WPA** | Deprecated | ❌ | Uses TKIP — multiple vulnerabilities |
| **WPA2-Personal** | Acceptable but not ideal | ⚠️ | PMKID/4-way handshake capture + offline cracking |
| **WPA2-Enterprise** | Good | ✅ | Uses 802.1X/RADIUS — per-user authentication |
| **WPA3-Personal** | Best for consumer | ✅ | SAE replaces PSK — forward secrecy |
| **WPA3-Enterprise** | Best overall | ✅ | 192-bit cryptographic suite |

### Wireless Attacks

| Attack | Description | Mitigation |
|--------|-------------|-----------|
| **Evil Twin** | Attacker creates a fake AP with same SSID | Certificate-based auth (802.1X) |
| **Rogue AP** | Unauthorized AP plugged into corporate network | Wireless IDS, network scanning |
| **WPA2 Handshake Capture** | Capture 4-way handshake for offline cracking | Use WPA3, strong passphrases |
| **PMKID Attack** | Captures PMKID directly without client — offline crack | WPA3-SAE, strong passphrases |
| **Deauth Attack** | Sends deauthentication frames to disconnect clients | 802.11w Management Frame Protection |
| **Wardriving** | Scanning for open or weak Wi-Fi networks | Proper encryption everywhere |

---

## VLANs — Virtual LANs

VLANs logically segment a switch into separate networks, even though devices share physical hardware.

**Why VLANs matter in security:**
- Isolate guest Wi-Fi from corporate network
- Separate finance from engineering from HR
- Limit broadcast domains — reduce attack surface
- Contain a compromised device to its VLAN

**VLAN Hopping attack**: An attacker tricks a switch port into becoming a trunk port (which carries all VLANs), then sends double-tagged 802.1Q frames to reach VLANs they should not have access to.

**Mitigation**: Disable DTP (Dynamic Trunking Protocol) on access ports, use a dedicated native VLAN not associated with any users.

---

## Network Security Controls Summary

| Control | Purpose | Example |
|---------|---------|---------|
| **Firewall** | Filter traffic by rules | Block inbound RDP from internet |
| **IDS** | Detect intrusions, alert only | Snort alerting on SQL injection pattern |
| **IPS** | Detect and block intrusions | Suricata dropping malicious traffic inline |
| **VPN** | Encrypt transit traffic | Remote worker secure tunnel to office |
| **VLAN** | Segment network logically | Guest devices isolated from corp data |
| **NAC** | Control which devices can join | 802.1X rejecting unregistered devices |
| **WAF** | Protect web applications | Blocking SQLi and XSS at the HTTP layer |
| **SIEM** | Correlate network logs for detection | Alerting on port scanning patterns |
| **Proxy** | Inspect and filter web traffic | Blocking malware-hosting domains |
| **DLP** | Prevent data leaving the network | Stopping credit card numbers in email |
| **DMZ** | Isolate public-facing servers | Web server separate from internal database |

---

## Interview Questions & Answers

**Q1. What is a computer network and how does it work?**
> "A computer network is a collection of interconnected devices — computers, servers, routers, switches — that communicate using shared protocols to exchange data and resources. When data is sent, the sending device breaks it into packets, each labeled with source and destination IP addresses. Routers forward packets across network hops using routing tables to find the best path. At the destination, packets are reassembled in the correct order using sequence numbers. Protocols like TCP ensure reliable delivery with acknowledgment, while UDP provides faster connectionless delivery for real-time applications."

**Q2. What is the difference between a router, switch, and hub?**
> "A hub broadcasts every packet to every connected device — it has no intelligence and creates the most traffic and the worst security posture. A switch learns MAC addresses and forwards frames only to the specific port where the destination device lives — much more efficient and secure. A router operates at Layer 3 and routes packets between different networks using IP addresses and routing tables. In a security context: hubs are dangerous because any connected device can sniff all traffic; switches are better but vulnerable to MAC flooding attacks that force them to behave like hubs."

**Q3. What is a subnet and why is subnetting important for security?**
> "A subnet is a logical subdivision of an IP network created by applying a subnet mask. Subnetting divides a large network into smaller segments — each with its own broadcast domain. From a security perspective, subnetting enables network segmentation: by placing sensitive systems in separate subnets, you ensure that traffic between them must pass through a router or firewall where security controls can be applied. A compromised device in one subnet cannot directly communicate with devices in other subnets without crossing a security boundary."

**Q4. What is NAT and how does it affect security investigations?**
> "NAT — Network Address Translation — allows multiple devices on a private network to share one public IP. From a security investigation standpoint, NAT can complicate attribution: if you see a malicious connection from `203.0.113.5`, that's the NAT gateway IP — the actual attacker could be any device behind that gateway. This is why ISPs and organizations use NAT logs to map public IP + port + timestamp to the specific private IP that made the connection. It also means firewall logs show the NATted address, not the original device IP."

**Q5. What is ARP and what is ARP poisoning?**
> "ARP — Address Resolution Protocol — maps an IP address to a MAC address on the local network segment. When a device wants to send traffic to `192.168.1.1`, it broadcasts 'Who has 192.168.1.1? Tell me your MAC address.' The device at that IP responds with its MAC. ARP poisoning is an attack where the attacker broadcasts fake ARP replies claiming their MAC is associated with another device's IP — typically the default gateway. All local devices update their ARP caches with the false mapping, sending all traffic through the attacker (man-in-the-middle). Defenses include Dynamic ARP Inspection (DAI) on switches and static ARP entries for critical hosts."

**Q6. What ports should you know by heart as a SOC analyst?**
> "The essential ports every analyst must know: 22 (SSH), 23 (Telnet — red flag if open), 25 (SMTP), 53 (DNS), 80 (HTTP), 110 (POP3), 143 (IMAP), 443 (HTTPS), 445 (SMB — EternalBlue target), 389 (LDAP), 636 (LDAPS), 3306 (MySQL), 3389 (RDP — common brute force target), 5985/5986 (WinRM), 8080/8443 (alternate web). When I see unexpected connections to port 3389 from internet IPs, it's likely a brute force. SMB on port 445 between internal hosts could be lateral movement. DNS queries on port 53 to unexpected external resolvers could be DNS tunneling."

**Q7. What is the DORA process in DHCP?**
> "DORA is the four-step process by which a device gets an IP address from a DHCP server: Discover — the device broadcasts asking for any DHCP server; Offer — the DHCP server responds with an available IP address and configuration; Request — the device requests that specific offer; Acknowledge — the server confirms the assignment with a lease duration. A rogue DHCP attack involves placing an unauthorized DHCP server on the network that responds to Discover messages first and assigns itself as the gateway and DNS server — routing all traffic through the attacker."

**Q8. What is DNS and what are the most common DNS-based attacks?**
> "DNS translates domain names like `google.com` into IP addresses. The resolution goes from local cache → recursive resolver → root nameserver → TLD server → authoritative nameserver. Common attacks include: DNS cache poisoning — injecting false records into a resolver's cache to redirect traffic; DNS hijacking — changing DNS settings on a router or device to point to malicious resolvers; DNS tunneling — encoding data in query subdomain names to exfiltrate data or communicate with C2 through firewalls that permit DNS; and DNS amplification DDoS — using open resolvers to generate large response traffic toward a spoofed victim IP."

**Q9. What is the difference between WPA2 and WPA3?**
> "WPA2 uses a Pre-Shared Key (PSK) and the 4-way handshake to authenticate clients. The handshake can be captured passively when any client authenticates and then cracked offline using dictionary attacks — wordlists like rockyou.txt are effective against weak passphrases. WPA3 replaces PSK with SAE — Simultaneous Authentication of Equals — which provides forward secrecy and is resistant to offline dictionary attacks because each authentication requires interaction with the access point. WPA3 also enforces Protected Management Frames (802.11w) which prevents deauthentication attacks."

**Q10. What is a VLAN and how does VLAN hopping work?**
> "A VLAN is a logical network partition that groups devices on a switch into separate broadcast domains regardless of their physical port. VLAN hopping allows an attacker to send traffic to a VLAN they shouldn't have access to. The most common method uses double tagging — the attacker's frame has two 802.1Q VLAN headers: the outer tag matches the native VLAN of a trunk port, the switch strips it and forwards the frame with the inner tag to the target VLAN. Prevention: disable DTP on all access ports with `switchport nonegotiate`, set the native VLAN to an unused VLAN ID, and restrict trunk links to explicitly permitted VLANs only."

**Q11. What is the difference between TCP and UDP and when is each used?**
> "TCP is connection-oriented — it uses a three-way handshake (SYN, SYN-ACK, ACK) to establish a session before data transfer, guarantees delivery and ordering through sequence numbers and acknowledgments, and retransmits lost packets. This reliability makes it ideal for web browsing, email, SSH, and file transfers where data integrity matters. UDP is connectionless — it sends packets with no handshake, no acknowledgment, and no retransmission. It's faster and more efficient, making it ideal for DNS, VoIP, video streaming, and online gaming where a dropped packet is better than waiting for a retransmit. Security note: both can be abused — SYN floods target TCP, while UDP amplification targets UDP."

**Q12. What is network segmentation and why is it a defense-in-depth control?**
> "Network segmentation divides a network into isolated zones using VLANs, subnets, and firewall rules. Each zone can have its own access controls — for example, isolating servers, workstations, guest Wi-Fi, IoT devices, and critical infrastructure in separate zones. The security benefit is containment: if an attacker compromises a device in the workstation zone, they cannot directly reach servers in the server zone without passing through a firewall that enforces zone-crossing policies. This 'blast radius' limitation means a compromise in one zone doesn't automatically become a compromise everywhere — which is the core principle of defense in depth."

**Q13. What is the purpose of a DMZ?**
> "A DMZ — Demilitarized Zone — is a network segment that sits between the untrusted internet and the trusted internal network, hosting public-facing services like web servers, mail servers, and DNS servers. It's implemented with two firewall boundaries: the external firewall allows internet traffic to reach the DMZ on specific ports; the internal firewall restricts what the DMZ can reach inside the network, allowing only specific necessary communication. If a DMZ server is compromised, the attacker has to breach the internal firewall — a second control boundary — to reach internal systems. Without a DMZ, a compromised web server would have direct access to internal resources."

---

!!! success "Key Facts to Remember"
    - **LAN** = local; **WAN** = wide; **MAN** = metro; **PAN** = personal
    - **Switch** = MAC addresses, Layer 2 | **Router** = IP addresses, Layer 3 | **Hub** = broadcasts everything (avoid)
    - **TCP** = reliable, ordered, handshake | **UDP** = fast, connectionless, no guarantee
    - **NAT** = many private IPs → one public IP (PAT is the most common form)
    - **DNS port 53** | **DHCP ports 67/68** | **HTTPS port 443** | **RDP port 3389** | **SMB port 445**
    - **VLAN hopping** → disable DTP | **ARP poisoning** → Dynamic ARP Inspection | **Rogue DHCP** → DHCP Snooping
    - **WPA3 > WPA2 > WPA > WEP (broken)**
    - **Subnetting** = containment | **Segmentation** = blast radius control | **DMZ** = public services isolation
