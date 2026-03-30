# VPN, Firewall, and Proxy

VPNs, firewalls, and proxies all deal with network traffic, but they solve different problems. A firewall filters traffic, a VPN encrypts traffic, and a proxy forwards traffic on behalf of a client or server.
{ .page-lead }

!!! note "Interview answer"
    *"A firewall controls and filters network traffic based on rules — it decides what can pass and what gets blocked. A VPN creates an encrypted tunnel over an untrusted network to protect data in transit and enable secure remote access. A proxy acts as an intermediary between a client and a destination, forwarding requests on behalf of one side. They are different controls, but they are often layered together in a real network security architecture."*

---

## Firewall

A firewall is a security control that monitors and filters traffic based on predefined rules. It sits at the boundary between network segments and decides what traffic is allowed or blocked based on IP address, port, protocol, direction, and connection state.

### Firewall Rule Actions

| Action | What It Does | When to Use |
|--------|-------------|------------|
| **Allow / Permit** | Traffic matching this rule is forwarded normally | Explicitly approved traffic flows |
| **Deny** | Traffic is silently dropped — no notification sent to sender | Default-deny posture for most rules |
| **Drop** | Same as Deny — packet is discarded | Often used interchangeably with Deny |
| **Reject** | Traffic is blocked AND the sender receives an ICMP "destination unreachable" error | When you want the sender to know the connection was refused |
| **Log** | Traffic is recorded without blocking | Auditing and monitoring specific flows |

!!! tip "Deny vs. Reject"
    **Deny/Drop** is usually preferred over **Reject** — with Deny, the sender gets no response (stealth), making it harder for attackers to probe what's behind the firewall. **Reject** gives an active response that helps attackers understand the network topology.

### Firewalla — Consumer & SMB Firewall

**Firewalla** is a smart network security device designed for homes, small businesses, and power users. It combines firewall, IDS/IPS, VPN, and traffic analytics in a compact device connected to your router.

#### Firewalla Rule Actions in Practice

| Rule Type | What Firewalla Does | Example |
|-----------|--------------------|-|
| **Block (Deny)** | Silently drops matching traffic — no response sent | Block all outbound traffic from a child's device after 10PM |
| **Allow** | Explicitly permits traffic that would otherwise be blocked | Allow a specific IP to bypass the ad-blocker rule |
| **VPN Route** | Directs specific traffic through the VPN tunnel | Route streaming traffic through US VPN exit |
| **Alarm** | Generates an alert without blocking | Watch a device but don't block it yet |

#### Firewalla Deny Rule — Example

```
# Firewalla Block Rule (via Firewalla App or API):
# Block a specific device from accessing the internet during a defined period
# Device: 192.168.1.105 (a specific IoT device)
# Action: Block (deny all outbound)
# Schedule: Always / or 10PM–7AM

Rule Name:   "Block IoT Camera Outbound"
Source:      192.168.1.105 (device MAC: aa:bb:cc:dd:ee:ff)
Destination: Internet (all external IPs)
Action:      BLOCK
Direction:   Outbound
Schedule:    Always active
```

**What happens:** The Firewalla device drops any packet from `192.168.1.105` destined for an external IP without sending a response. The IoT camera cannot phone home to its manufacturer's servers.

#### Firewalla Drop Rule — Example

```
# Firewalla Drop Rule — Block a known malicious IP
# Firewalla automatically blocks discovered threats via its intelligence feeds
# Manual rule via Rules → Add Rule:

Rule Name:   "Drop Malicious C2 Traffic"
Source:      Any (all internal devices)
Destination: 185.220.101.45 (known Tor exit / C2 IP)
Action:      DROP
Direction:   Both (inbound and outbound)
Schedule:    Always active
```

**What happens:** Any internal device attempting to communicate with `185.220.101.45` has its packets silently dropped. No connection is established. The behavior shows up in Firewalla's flow monitor as blocked.

#### Firewalla REJECT Rule — Example

```
# Firewalla Rule — Reject (send RST) for internal service
# Used when you want the client to know immediately the service is unavailable
# Example: Block Telnet access to internal router but notify the client

Rule Name:   "Reject Telnet to Router"
Source:      Any LAN device
Destination: 192.168.1.1 (router management IP)
Port:        TCP 23 (Telnet)
Action:      REJECT
Direction:   Inbound to router
```

**What happens:** Any LAN device trying to Telnet to the router receives a TCP RST immediately, effectively saying "connection refused." The device knows the service is blocked, allowing monitoring software to log the attempt clearly.

### Common Firewall Types

| Type | What It Checks | Example |
|------|---------------|---------|
| Packet Filtering | IP, port, and protocol (stateless) | Basic ACL on a router |
| Stateful Inspection | Tracks connection state — knows if a packet is part of an established session | Enterprise perimeter firewall |
| Application Layer (WAF) | Inspects HTTP/HTTPS request content | Cloudflare WAF, ModSecurity |
| Next-Generation Firewall (NGFW) | Deep packet inspection, app awareness, user identity, IPS | Palo Alto, Fortinet FortiGate, Cisco FTD |
| Host-based Firewall | Runs on the endpoint itself | Windows Defender Firewall, `ufw`, `iptables` |

### Real-world Firewall Rule Examples

```
# iptables examples (Linux):
iptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/24 -j ACCEPT   # Allow SSH from internal network
iptables -A INPUT -p tcp --dport 22 -j DROP                      # Drop all other SSH (deny by default)
iptables -A INPUT -p tcp --dport 3389 -j DROP                    # Block all inbound RDP
iptables -A OUTPUT -d 185.220.101.45 -j DROP                     # Block outbound to known C2

# Palo Alto (example rule logic):
# Name: Block-Inbound-RDP
# Source: any (internet)
# Destination: DMZ servers
# Application: ms-rdp
# Action: deny (log at end)
```

---

## VPN

A VPN (Virtual Private Network) creates an encrypted tunnel between two endpoints over the public internet, protecting data in transit and enabling secure remote access.

### Common VPN Types

| Type | Best Use | Notes |
|------|---------|-------|
| Remote Access VPN | Individual employees connecting to company | IPsec/IKEv2, SSL-VPN, WireGuard |
| Site-to-Site VPN | Connecting two offices over the internet | IPsec tunnel between gateways |
| SSL/TLS VPN | Browser-based access, easy to deploy | No client software required |
| Split-Tunnel VPN | Only corporate traffic goes through VPN | User's Netflix doesn't route through corp |
| Full-Tunnel VPN | All traffic routes through VPN | Maximum visibility and control for corp |

---

## Proxy

A proxy sits between a client and a destination and forwards requests on behalf of one side.

### Types of Proxy

| Type | Sits In Front Of | Main Purpose |
|------|----------------|-------------|
| Forward Proxy | Users or clients | Filtering, anonymity, caching, content control |
| Reverse Proxy | Servers or applications | Load balancing, SSL offload, hiding origin servers |
| Transparent Proxy | All user traffic (no client config needed) | Web filtering without user setup |
| HTTPS Inspection Proxy | All TLS traffic (break-and-inspect) | Decrypt, inspect for malware/DLP, re-encrypt |

---

## VPN vs Firewall vs Proxy

| Feature | VPN | Firewall | Proxy |
|---------|-----|---------|-------|
| Encrypts traffic | ✅ Yes | ❌ No | Sometimes (with TLS inspection) |
| Filters traffic | Limited | ✅ Yes (primary function) | ✅ Yes (application layer) |
| Hides client IP | ✅ Yes | ❌ No | ✅ Often |
| Protects full network path | ✅ Yes | ✅ Yes | ❌ Partial |
| Operates at which layer | Layer 3 (Network) | Layer 3–7 | Layer 7 (Application) |

---

## Interview Questions

**Q1. What is the difference between Deny and Reject in a firewall rule?**

> "Deny (or Drop) silently discards the packet — the sender receives no response and doesn't know why the connection failed. This is the preferred default because it gives attackers less information about the network. Reject actively sends back an ICMP 'destination unreachable' or TCP RST, telling the sender the connection was actively refused. Reject can be useful for internal networks where you want legitimate software to fail gracefully rather than hanging on a timeout, but it should be avoided on internet-facing interfaces."

**Q2. What does a Firewalla block rule actually do at the network level?**

> "A Firewalla block rule configures the device to drop matching packets silently — no response is sent back to the originating device. Firewalla sits inline on the network (typically connected between the router and switch, or operating in DHCP mode), so it has visibility into all traffic. When a device's packet matches a block rule by source IP, destination IP, port, or domain, Firewalla's Linux-based netfilter/iptables layer drops the packet without forwarding it. From the originating device's perspective, the connection simply times out."

**Q3. What is a default-deny firewall policy?**

> "A default-deny policy means all traffic is blocked by default, and only traffic explicitly permitted by an 'allow' rule is forwarded. This is the gold standard firewall posture. It's the opposite of a default-permit policy where everything is allowed unless explicitly blocked. Default-deny ensures that new services, ports, or protocols are always blocked until they are reviewed and intentionally opened — preventing accidental exposure of new attack surface."

**Q4. What is stateful inspection and why is it important?**

> "Stateful inspection tracks the state of network connections in a state table. When an outbound connection is established — for example, a web browser connecting to a server on port 443 — the firewall records that connection in its state table. When the server's response packets arrive inbound, the firewall allows them because they match an established outbound connection, without needing an explicit inbound allow rule. This is how modern firewalls work — allowing return traffic automatically while blocking unsolicited inbound connections. A stateless packet filter lacks this capability and would require explicit rules for both directions."

**Q5. What is a NGFW (Next-Generation Firewall) and what does it add over a traditional firewall?**

> "A Next-Generation Firewall adds Layer 7 application awareness and inspection to traditional stateful filtering. It can identify and control applications by their behavior rather than just port and protocol — distinguishing streaming video from business applications even if both use HTTPS port 443. NGFWs typically integrate: Deep Packet Inspection (DPI), SSL/TLS decryption and inspection, application control, user-identity integration (user-based rules rather than just IP-based), integrated IDS/IPS, URL categorization, and threat intelligence feeds. Examples: Palo Alto Networks with App-ID, Fortinet FortiGate, Cisco Firepower."

**Q6. What is a DMZ and how is it implemented with firewalls?**

> "A DMZ — Demilitarized Zone — is a network segment that sits between the public internet and the internal corporate network, hosting public-facing services like web servers, mail servers, and DNS servers. It's implemented using two firewalls (or a single firewall with three interfaces): the external firewall allows internet traffic to reach only the DMZ on specific ports; the internal firewall allows only specific, necessary communication from the DMZ to internal systems. This ensures that if a DMZ server is compromised, the attacker needs to breach a second firewall to reach internal systems."

---

!!! success "Quick Summary"
    - **Allow** = pass traffic | **Deny/Drop** = silent discard | **Reject** = active refusal with error
    - **Stateful** = tracks connection state automatically | **Stateless** = must define both directions
    - **Firewalla Block** = iptables DROP — silent, no response, preferred for security
    - **NGFW** = adds application awareness, DLP, IPS, SSL inspection to traditional firewall
    - **DMZ** = isolated segment between internet and internal network, two firewalls
    - **Default-deny** = block everything, permit only what's explicitly approved
