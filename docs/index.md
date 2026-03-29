# Welcome to SOCAtlas

SOCAtlas helps you master cybersecurity concepts in a clear order and revise them instantly before interviews or operational shifts. It is built for SOC analysts, engineers, students, and anyone who demands practical explanations with real attack scenarios and tools.
{ .page-lead }

<div class="hero-actions" markdown>
[Start With Fundamentals](fundamentals/introduction.md){ .md-button .md-button--primary }
[Open 1200 Quick Points](quick/basics.md){ .md-button }
</div>

!!! note "What you will find here"
    - core concepts explained in plain, interview-ready language
    - networking, threats, detection, governance, and cloud notes
    - real examples, tools, and attack scenarios for every topic
    - 1200 quick-revision points organized by domain

## Choose your starting point

<div class="grid cards" markdown>

-   __New to cybersecurity?__

    Begin with the fundamentals: what cybersecurity means, the CIA Triad, encryption, and hashing. These are the concepts that come up in every interview.

    [Open fundamentals](fundamentals/introduction.md)

-   __Networking feels fuzzy?__

    Review IP addressing, DNS, DHCP, VPNs, firewalls, proxies, and both the OSI and TCP/IP models. They are the backbone of most security discussions.

    [Study networking](networking/basics.md)

-   __Preparing for SOC roles?__

    Focus on SIEM, EDR, IDS, IPS, incident response, IOCs, IOAs, and the MITRE ATT&CK framework — exactly what SOC analysts use daily.

    [Go to detection and defense](defense/siem_soc_edr.md)

-   __Need fast revision?__

    Jump straight into the 1200 quick-point pages. Each row gives you a clean definition, a one-sentence answer, and a real-world example.

    [Jump to quick points](quick/basics.md)

</div>

## How to answer any security question

Follow this four-step structure and you will sound confident and clear in any technical interview:

1. **Define** the concept in one precise sentence.
2. **Explain** how it works in plain terms without unnecessary jargon.
3. **Give an example** such as a real attack, tool, or scenario.
4. **Connect** it to a control, framework, or defense strategy.

> **Example: firewall** "A firewall is a security control that filters network traffic based on predefined rules. It inspects source IPs, destination IPs, ports, and protocols to decide what is allowed or blocked. A company might block all inbound RDP from the internet at the perimeter firewall. Firewalls work alongside IDS, IPS, VPNs, and network segmentation as part of layered defense."

## Recommended study order

### Starting from zero

| Step | What to Read | Why |
|------|-------------|-----|
| 1 | [What is Cybersecurity?](fundamentals/introduction.md) | Build the mental model first |
| 2 | [CIA Triad](fundamentals/cia_triad.md), [Encryption](fundamentals/encryption.md), [Hashing](fundamentals/hashing.md) | The three pillars interviewers always test |
| 3 | [Networking Basics](networking/basics.md) and [OSI & TCP/IP Models](networking/osi_tcpip.md) | Everything connects through the network |
| 4 | [Vulnerabilities & Risk](threats/vulnerabilities.md) and [Modern Malware](threats/cyber_threats.md) | Know what you are defending against |
| 5 | [SIEM, SOC & EDR](defense/siem_soc_edr.md) and [Incident Response](defense/incident_response.md) | The tools and playbooks defenders use |

### Fast revision before an interview

1. Skim [Basics](quick/basics.md)
2. Review [Attacks](quick/attacks.md) and [Tools](quick/tools.md)
3. Revisit [Security frameworks](frameworks.md)
4. Finish with [IOC, IOA & MITRE ATT&CK](governance/ioc_ioa_mitre.md)

## Must-know concepts at a glance

| Concept | What it means in one line | Key tool or reference |
|---------|--------------------------|----------------------|
| CIA Triad | Confidentiality, Integrity, Availability — the three security properties everything maps to | Foundation of every control decision |
| Zero Trust | Never trust anything by default; verify every user, device, and context continuously | Zscaler, BeyondCorp, Conditional Access |
| SIEM | Centralized log collection, search, and correlation for detecting and investigating threats | Splunk, Microsoft Sentinel, IBM QRadar |
| EDR | Endpoint monitoring that records behavior and supports detection, containment, and investigation | CrowdStrike Falcon, SentinelOne, Defender for Endpoint |
| MFA | Verifying identity with two or more independent factors to stop credential-only attacks | Duo Security, YubiKey, Microsoft Authenticator |
| Zero-Day | A vulnerability exploited before the vendor has patched or even acknowledged it | Log4Shell, EternalBlue before patch |
| DDoS | Flooding a service with traffic from many sources until it becomes unavailable | Cloudflare, AWS Shield, scrubbing centers |
| Kill Chain | Lockheed Martin model showing how an attack progresses through seven sequential phases | Reconnaissance → Actions on Objectives |
| MITRE ATT&CK | Knowledge base of real-world adversary tactics and techniques mapped to detections | [attack.mitre.org](https://attack.mitre.org) |
| IR Cycle | Structured process — Prepare, Identify, Contain, Eradicate, Recover, Lessons Learned | NIST SP 800-61 |

!!! tip "Use the site in two modes"
    **Learning mode:** Start with the guide pages under Fundamentals, Networking, Threats, and Detection. They give you context, examples, and structure.
    **Revision mode:** Switch to the quick-point pages when you want shorter answers you can review rapidly.
