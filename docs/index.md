# Welcome to SOCAtlas

SOCAtlas is your complete cybersecurity operations reference — 1200 interview-ready quick points, real SOC alert playbooks, major attack deep-dives, and structured study guides built for analysts, engineers, and anyone preparing for a security role.
{ .page-lead }

<!-- complete-guide:omit:start -->
<div class="hero-actions" markdown>
[Start With Fundamentals](fundamentals/introduction.md){ .md-button .md-button--primary }
[Open 1200 Quick Points](quick/basics.md){ .md-button }
[Download as PDF](#pdf-builder){ .md-button }
</div>

Choose sections, switch between color or paper-friendly output, and let Chrome open `Save as PDF` for the cleanest export. A recommended starter pack is loaded first so you can download faster.
<!-- complete-guide:omit:end -->

!!! note "What you will find here"
    - **1200 quick-revision points** organized into 12 focused domains — from core basics to expert-edge topics
    - **12 SOC alert playbooks** covering real-world triage, investigation, containment, and escalation workflows
    - **Major attack breakdowns** for XSS, SQLi, CSRF, SSRF, MitM, ARP spoofing, and DoS
    - **Structured study guides** covering fundamentals, networking, threats, detection, governance, and cloud
    - **Interview answer frameworks** — every concept explained with a definition, mechanism, example, and control

<!-- complete-guide:omit:start -->
<section id="pdf-builder" class="pdf-builder" data-pdf-builder data-config="assets/pdf-sections.json"></section>
<!-- complete-guide:omit:end -->

## Choose your starting point

<div class="grid cards" markdown>

-   __New to cybersecurity?__

    Start with the CIA Triad, encryption, and hashing — the three concepts that come up in every single interview. Then move into networking before anything else.

    [Open fundamentals](fundamentals/introduction.md)

-   __Networking feels unclear?__

    Review IP addressing, DNS, DHCP, VPNs, firewalls, proxies, and both the OSI and TCP/IP models. Network knowledge is the backbone of every security discussion.

    [Study networking](networking/basics.md)

-   __Preparing for SOC analyst roles?__

    Work through the SIEM, EDR, IDS/IPS, incident response, and alert playbook sections — exactly what analysts use every shift in a real SOC environment.

    [Go to detection and defense](defense/siem_soar.md)

-   __Need fast revision?__

    Jump straight into the 1200 quick-point pages. Each row gives you the concept name, a one-sentence answer you can say in an interview, and a real-world example.

    [Jump to quick points](quick/basics.md)

</div>

## How to answer any security question

Use this four-step structure and you will sound confident and structured in any technical interview:

1. **Define** the concept in one precise sentence.
2. **Explain** how it works in plain terms, without unnecessary jargon.
3. **Give an example** — a real attack, tool, breach, or scenario.
4. **Connect** it to a control, framework, or defense strategy.

> **Example — firewall:** "A firewall is a security control that filters network traffic based on predefined rules. It inspects source IP, destination IP, ports, and protocols to decide what is allowed or blocked. A company might block all inbound RDP from the internet at the perimeter firewall. Firewalls work alongside IDS, IPS, VPNs, and network segmentation as part of a layered defense strategy."

## Recommended study order

### Starting from zero

| Step | What to Read | Why It Matters |
|------|-------------|----------------|
| 1 | [What is Cybersecurity?](fundamentals/introduction.md) | Build the mental model before diving into controls |
| 2 | [CIA Triad](fundamentals/cia_triad.md), [Encryption](fundamentals/encryption.md), [Hashing](fundamentals/hashing.md) | The three pillars every interviewer tests on day one |
| 3 | [Networking Basics](networking/basics.md) and [OSI & TCP/IP Models](networking/osi_tcpip.md) | Everything connects through the network layer |
| 4 | [Vulnerabilities & Risk](threats/vulnerabilities.md) and [Cyber Threats](threats/cyber_threats.md) | Understand what you are defending against |
| 5 | [SIEM & SOAR](defense/siem_soar.md), [SOC Operations](defense/soc.md), [EDR & XDR](defense/edr_xdr.md) | The tools and platforms defenders use daily |
| 6 | [Incident Response](defense/incident_response.md) and [SOC Alert Playbooks](alerts/general.md) | How to act when something goes wrong |

### Fast revision before an interview (2 hours)

| Time | What to Revise |
|------|---------------|
| 0–30 min | Skim [Core Basics 1–100](quick/basics.md) — cover CIA Triad, AAA, and core controls |
| 30–60 min | Review [Attacks 201–300](quick/attacks.md) and [Tools 301–400](quick/tools.md) |
| 60–90 min | Read [Identity & Auth 101–200](quick/fundamentals.md) and [Security Practices 401–500](quick/practices.md) |
| 90–120 min | Finish with [MITRE ATT&CK](governance/ioc_ioa_mitre.md) and [Frameworks](frameworks.md) |

## Must-know concepts at a glance

| Concept | One-line definition | Key tool or reference |
|---------|--------------------|-----------------------|
| CIA Triad | Confidentiality, Integrity, Availability — every control maps to one of these | Foundation of every security decision |
| Zero Trust | Never trust anything by default; verify every user, device, and context continuously | Zscaler, BeyondCorp, Conditional Access |
| SIEM | Centralized log collection, correlation, and alerting for detecting and investigating threats | Splunk, Microsoft Sentinel, IBM QRadar |
| EDR | Endpoint monitoring that records behavior and enables detection, containment, and investigation | CrowdStrike Falcon, SentinelOne, Defender for Endpoint |
| MFA | Verifying identity with two or more independent factors to stop credential-only attacks | Duo Security, YubiKey, Microsoft Authenticator |
| Zero-Day | A vulnerability actively exploited before the vendor has produced a patch | Log4Shell, EternalBlue (before MS17-010 patch) |
| DDoS | Flooding a service with traffic from many sources simultaneously until it becomes unavailable | Cloudflare, AWS Shield, scrubbing centres |
| Kill Chain | Lockheed Martin model showing how an attack progresses through seven sequential phases | Reconnaissance → Actions on Objectives |
| MITRE ATT&CK | Knowledge base of real-world adversary tactics and techniques mapped to detections | [attack.mitre.org](https://attack.mitre.org) |
| IR Cycle | Structured process — Prepare, Identify, Contain, Eradicate, Recover, Lessons Learned | NIST SP 800-61, PICERL (SANS) |
| CVSS | Common Vulnerability Scoring System — rates severity 0–10 based on exploitability and impact | CVE-2021-44228 (Log4Shell) scored 10.0 |
| Least Privilege | Grant only the minimum access needed for a task, nothing more | IAM role scoping, PAM vaults, RBAC |

## The 12 SOC alert playbooks

Each alert page includes: what the alert means, what to check as L1, a full spoken interview answer, and a memory-friendly summary.

| Alert Type | What It Covers |
|-----------|---------------|
| [General Alert Handling](alerts/general.md) | The universal triage workflow for any SIEM alert |
| [Malware Infection](alerts/malware.md) | EDR/AV alert triage, hash verification, endpoint isolation |
| [Ransomware Attack](alerts/ransomware.md) | Containment-first response, backup restore, eradication |
| [Phishing & Email Threats](alerts/phishing.md) | Header analysis, user impact, global purge |
| [DDoS Attack](alerts/ddos.md) | Distinguishing DDoS from traffic spikes, mitigation steps |
| [Brute Force & Password Spray](alerts/brute_force.md) | Lockout detection, spray vs. stuffing vs. brute force |
| [CrowdStrike EDR Alert](alerts/crowdstrike.md) | Falcon-specific alert triage and response workflow |
| [Impossible Travel](alerts/impossible_travel.md) | Geo-anomaly investigation and account containment |
| [Suspicious PowerShell](alerts/powershell.md) | Script analysis, AMSI bypass detection, LOL techniques |
| [Data Exfiltration](alerts/data_exfil.md) | Volume anomalies, DLP alerts, DNS tunneling indicators |
| [SQL Injection (WAF)](alerts/sqli.md) | WAF log analysis, payload review, app-layer investigation |
| [Privilege Escalation](alerts/priv_esc.md) | Token abuse, lateral movement, admin account containment |

!!! tip "Two modes of study"
    **Learning mode:** Work through the guide pages under Fundamentals, Networking, Threats, and Detection. They give you context, worked examples, and structured explanations.
    **Revision mode:** Switch to the 1200 quick-point pages when you want concise answers you can review in minutes before walking into an interview.
