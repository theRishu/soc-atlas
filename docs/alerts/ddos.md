# 🌊 DDoS Attack

A Distributed Denial of Service attack overwhelms a target with traffic from thousands or millions of sources — making it unavailable to legitimate users. Knowing how to distinguish a real DDoS from a traffic spike is a core SOC skill.
{ .page-lead }

!!! note "DoS vs. DDoS"
    A **DoS** (Denial of Service) comes from a **single source**. A **DDoS** (Distributed DoS) comes from **many sources simultaneously** — often a botnet of thousands of compromised devices. DDoS is far harder to block because you cannot just ban one IP.

---

## DDoS Attack Categories

| Layer | Type | What It Targets | Example |
|-------|------|----------------|---------|
| **Layer 3/4 (Volumetric)** | UDP Flood, ICMP Flood | Bandwidth saturation | Mirai botnet (2016 — 1.2 Tbps) |
| **Layer 3/4 (Protocol)** | SYN Flood, Ping of Death | Server connection tables | SYN queue exhaustion |
| **Layer 4 (Amplification)** | DNS/NTP Amplification | Spoofed source — victim receives amplified responses | 100 byte query → 3,000 byte response |
| **Layer 7 (Application)** | HTTP Flood, Slowloris | Web server resources | Mimics legitimate user requests |

---

## What to Check (SOC L1 Checklist)

| Priority | Check | Details |
|----------|-------|---------|
| 🔴 First | **Is the service actually down?** | Check monitoring — is this an alert or confirmed outage? |
| 🔴 First | **Source pattern** | Single IP (DoS) or thousands of IPs (DDoS)? Spoofed or real? |
| 🟡 Second | **Traffic volume** | How many Gbps/Mpps? Compare to normal baseline |
| 🟡 Second | **Attack type** | Volumetric? SYN flood? HTTP flood? Amplification? |
| 🟠 Third | **Port and protocol** | UDP 80/443? Random high ports? Specific service targeted? |
| 🟠 Third | **Geographic distribution** | Traffic from unexpected countries or all from one region? |
| 🟢 Fourth | **Is DDoS protection active?** | Cloudflare, AWS Shield, scrubbing center — check their status |

---

## Response Workflow

### Immediate (0–5 minutes)
1. **Confirm it is an attack** — check monitoring dashboards, CDN/ISP alerts, and user reports
2. **Notify the ISP or DDoS protection provider** — they may have upstream mitigation options
3. **Enable or escalate DDoS protection** — Cloudflare Under Attack Mode, AWS Shield Advanced response, Arbor/Radware scrubbing activation
4. **Do NOT try to block individual IPs** on your own firewall — volumetric attacks saturate the link before your firewall can process anything

### Short-term Mitigation
- **Rate limiting** at CDN and load balancer layer
- **Geo-blocking** if source is concentrated in unexpected regions
- **Challenge page** (CAPTCHA / JavaScript challenge) for HTTP floods
- **Anycast diffusion** — traffic spread across many PoPs
- **Blackhole routing** — last resort, null-routes traffic but also makes you unreachable

### Post-Attack Analysis
- Review ISP NetFlow / firewall logs for attack signature
- Identify if the DDoS was a smokescreen for another attack (data exfiltration, credential theft)
- Tune rate limits and blacklist rules based on the attack pattern

---

## Interview Questions & Answers

**Q1. What is a DDoS attack and how is it different from a DoS?**

> "A DoS — Denial of Service — originates from a single source and floods a target to make it unavailable. A DDoS — Distributed Denial of Service — uses thousands or millions of sources simultaneously, typically from a botnet of compromised devices. DDoS is far harder to defend against because you cannot just block one IP — the traffic arrives from across the internet. The scale also means it can saturate the upstream bandwidth before any on-premise mitigation can act."

**Q2. What is a botnet and how does it relate to DDoS?**

> "A botnet is a network of compromised devices — PCs, servers, IoT devices — remotely controlled by an attacker through command-and-control infrastructure. The attacker issues a command and all bots simultaneously flood the target with traffic. The Mirai botnet in 2016 compromised thousands of IoT devices (cameras, routers, DVRs) and launched attacks peaking at 1.2 Tbps — the largest DDoS recorded at that time. The distributed nature of botnets makes volumetric DDoS extremely difficult to mitigate without ISP- or CDN-level intervention."

**Q3. What is an amplification attack?**

> "An amplification attack exploits protocols that return much larger responses than the original request. The attacker spoofs the victim's IP as the source address and sends small requests to many open servers — commonly DNS resolvers or NTP servers. Those servers send their large responses to the apparent source — the victim — overwhelming it with traffic the victim never requested. DNS amplification can achieve amplification factors of 28–54x; NTP amplification can reach 556x."

**Q4. What is a SYN flood?**

> "A SYN flood exploits the TCP three-way handshake. Normally, a client sends SYN, the server responds with SYN-ACK and reserves a connection slot, and the client completes with ACK. In a SYN flood, the attacker sends thousands of SYN packets using spoofed source IPs and never sends the final ACK. The server fills its connection table — called the SYN backlog — waiting for completions that never arrive, eventually refusing legitimate connections. Mitigations include SYN cookies, reducing SYN timeout, and upstream filtering."

**Q5. What is the difference between a volumetric, protocol, and application-layer DDoS?**

> "Volumetric attacks saturate raw bandwidth — measured in Gbps or Tbps — by flooding the network link with UDP, ICMP, or amplified traffic. Protocol attacks exploit weaknesses in network protocols to exhaust server or firewall state tables — SYN floods are the primary example. Application-layer (Layer 7) attacks send seemingly legitimate HTTP requests at high volume to exhaust web server resources like CPU and connections — these are harder to detect because individual requests look valid and volume alone doesn't trigger alerts."

**Q6. How do you distinguish a DDoS from a legitimate traffic spike?**

> "A legitimate traffic spike is characterized by: requests from diverse geographic locations matching your user base, normal browser User-Agent strings and HTTP headers, requests distributed across multiple pages and endpoints, and traffic that correlates with a known event like a sale or news coverage. A DDoS shows: traffic from unexpected geographies or ASNs, identical or randomized User-Agent strings, requests hitting a single endpoint repeatedly, traffic that doesn't follow your normal diurnal pattern, and incoming SYN packets without completed handshakes."

**Q7. What is Cloudflare Under Attack Mode?**

> "Cloudflare's Under Attack Mode presents every visitor with a JavaScript challenge before allowing them to access the protected site. It imposes a 5-second delay while the browser executes JavaScript that proves it is a real browser — bots and simple HTTP clients typically cannot complete this challenge. This is a Layer 7 mitigation effective against HTTP flood attacks but it requires that your site is behind Cloudflare's reverse proxy for it to work."

**Q8. What is blackhole routing and when is it used?**

> "Blackhole routing — also called RTBH (Remotely Triggered Black Hole) — is a last-resort mitigation where the ISP or network operator announces that traffic destined for the attacked IP should be dropped at the network edge rather than forwarded. It stops the attack from reaching your infrastructure but makes your service completely unreachable — the target IP is effectively offline. It is used only when the attack volume is so large it saturates upstream links and no other mitigation is effective."

**Q9. Could a DDoS be a smokescreen for another attack?**

> "Yes — this is a known adversary technique. While the security team is consumed by the DDoS response, an attacker simultaneously conducts a data breach, credential theft, or network intrusion behind the noise. The DDoS consumes analyst attention, floods logs with noise, and may degrade monitoring visibility. During any significant DDoS, a good SOC continues monitoring other telemetry — especially authentication logs, data egress, and privileged account activity — for secondary threats."

**Q10. What is the role of an ISP in DDoS mitigation?**

> "ISPs can implement upstream mitigation that operates before traffic ever reaches your network — this is necessary for high-volume volumetric attacks that saturate your internet link. ISPs use techniques like traffic scrubbing (diverting traffic through cleaning centers that strip attack traffic and pass clean traffic), BGP blackholing, and rate limiting at peering points. Many organizations have pre-negotiated DDoS mitigation contracts with their ISP or use cloud-based scrubbing services like Cloudflare, AWS Shield Advanced, or Akamai Prolexic."

**Q11. What logs do you review after a DDoS attack?**

> "I review: firewall and router NetFlow or sFlow data to see the traffic volume and source distribution; IDS/IPS logs for attack signature patterns; CDN or load balancer access logs for HTTP flood characteristics; infrastructure monitoring for availability and latency during the attack window; and DNS query logs if a DNS amplification attack was involved. I also review any secondary security alerts that fired during the DDoS window to check for simultaneous attacks."

**Q12. What is Slowloris and why is it hard to detect?**

> "Slowloris is a Layer 7 DDoS tool that keeps many connections to the target web server open simultaneously by sending HTTP headers incrementally and extremely slowly — never completing the request. Most web servers have a limit on concurrent connections, and Slowloris exhausts this limit while using very low bandwidth itself. It is hard to detect because the traffic volume is low, each connection looks like a slow legitimate user, and simple rate limiting by IP may not be effective. Mitigations include setting aggressive connection timeouts and using a reverse proxy like nginx that handles slow connections efficiently."

---

!!! success "Very Short Version (Easy to Remember)"
    - **Confirm** it's a real attack, not a spike — check monitoring and CDN dashboards
    - **Classify** the attack type: volumetric (bandwidth), protocol (SYN), or application (HTTP)?
    - **Activate** DDoS protection: Cloudflare, Shield, ISP scrubbing — don't block individual IPs
    - **Geo-block** if source is heavily concentrated in unexpected regions
    - **Watch for smokescreen** — monitor for secondary attacks behind the DDoS noise
    - **Post-attack**: analyze logs, tune rate limits, check for data exfiltration
