# ⚡ Core Basics — Points 1–100

The essential 100 concepts every security professional must know cold. These are the building blocks that come up in every interview, every shift, and every security conversation.
{ .page-lead }

!!! note "Format: No. → Concept → Interview Answer → Example / Tool"
    Each row gives you the concept name, a one-sentence answer you can speak in an interview, and a concrete real-world example or tool.

---

## Core essentials (1-25)
*Foundational concepts used daily in security operations.*

| No. | Concept | Interview Answer | Example / Tool |
|---|---|---|---|
| 1 | Cybersecurity | Protecting systems, networks, and data from digital attacks or theft. | Critical infrastructure & privacy. |
| 2 | CIA Triad | Confidentiality, Integrity, and Availability. | Every control must map to one of these. |
| 3 | Confidentiality | Ensuring information is accessible only to authorized users. | AES Encryption, MFA. |
| 4 | Integrity | Ensuring information is accurate and has not been tampered with. | Hashing (SHA-256), Digital Sigs. |
| 5 | Availability | Ensuring systems and data are accessible on demand. | Backups, Redundancy, DDoS prot. |
| 6 | Vulnerability | A weakness or flaw that could be exploited. | Unpatched software. |
| 7 | Threat | A potential event that could cause harm. | Malware, Phishing. |
| 8 | Risk | Likelihood × Impact. The chance of a threat hitting a vulnerability. | Unpatched public server. |
| 9 | Asset | Anything the organization values (Money, Trust, Data). | Source-code or Customer DB. |
| 10 | Attack | An actual attempt to exploit a weakness. | SQLi or Ransomware. |
| 11 | AAA Framework | Authentication, Authorization, and Accounting. | RADIUS, TACACS+, Azure AD. |
| 12 | Authentication | Verifying "Who are you?" | Passwords, Biometrics. |
| 13 | Authorization | Deciding "What are you allowed to do?" | Permissions, RBAC. |
| 14 | Accounting | Recording "What did you actually do?" | Audit logs, session history. |
| 15 | Least Privilege | Giving only the minimum access needed for a job. | HR shouldn't see network configs. |
| 16 | Defense in Depth | Using multiple layers of security. | Firewall + EDR + MFA + Training. |
| 17 | Security Control | A safeguard used to reduce risk. | Encryption, policies, guards. |
| 18 | Physical Control | Barriers like fences, locks, and cameras. | Data center security. |
| 19 | Technical Control | Software/Hardware measures like firewalls. | SIEM, AV, Encryption. |
| 20 | Admin Control | Policies and procedures. | Incident Response Plan, AUP. |
| 21 | Preventive | Stops incidents before they happen. | Firewall, MFA. |
| 22 | Detective | Finds incidents after they occur. | SIEM, logs, motion sensors. |
| 23 | Corrective | Fixes damage after an incident. | Backups, patching. |
| 24 | Deterrent | Discourages attackers (raising the cost of failure). | Warning signs, cameras. |
| 25 | Compensating | An alternative control used when the primary isn't possible. | VLAN isolation for unpatched legacy gear. |

---

## Networking and infrastructure (26-50)
*The protocols and systems that connect the world.*

| No. | Concept | Interview Answer | Example / Tool |
|---|---|---|---|
| 26 | OSI Model | Layers 1-7 (Physical to Application). | Troubleshooting a web connection. |
| 27 | TCP/IP Model | 4 layers: Link, Internet, Transport, Application. | Underlying protocol of the internet. |
| 28 | IP Address | Unique identifier for a device on a network. | IPv4 and IPv6. |
| 29 | MAC Address | Physical unique address (burned into the NIC). | Hardware identification. |
| 30 | Port | A logical endpoint for a specific service. | Port 80 (HTTP), 443 (HTTPS), 22 (SSH). |
| 31 | Firewall | Filters traffic based on rules. | Palo Alto, Fortinet. |
| 32 | VPN | Encrypted tunnel over an untrusted network. | Safe remote work. |
| 33 | Proxy | Intermediary server between client and destination. | Filtering web content. |
| 34 | IDS | Passive intrusion detection and alerting. | Snort, Zeek. |
| 35 | IPS | Active intrusion prevention and blocking. | Cisco Firepower. |
| 36 | DMZ | Isolated segment for public-facing servers. | Protecting the internal network from web servers. |
| 37 | VLAN | Logical network separation. | Separating Guest Wi-Fi from Prod. |
| 38 | NAC | Ensures only authorized/healthy devices connect. | Port security on switches. |
| 39 | Air Gap | Physical isolation from the internet. | Nuclear or military control systems. |
| 40 | DNS | Translates names to IP addresses. | google.com to 142.250... |
| 41 | DHCP | Automatically assigns IP addresses to devices. | DORA process. |
| 42 | Default Gateway | The router that traffic takes to leave the subnet. | Routing traffic to the internet. |
| 43 | Subnet Mask | Defines which part of an IP is the network vs host. | 255.255.255.0. |
| 44 | ICMP | Protocol used for diagnostics (ping/traceroute). | Troubleshooting network connectivity. |
| 45 | SSL/TLS | Standard for encrypting web traffic. | HTTPS. |
| 46 | HTTP/HTTPS | Protocol for web communication. | Ports 80 and 443. |
| 47 | SSH | Secure remote command-line access. | Managing Linux servers remotely. |
| 48 | RDP | Remote desktop protocol for Windows. | Port 3389. |
| 49 | FTP/SFTP | File transfer protocol (Symmetric/Secure). | Ports 21 and 22. |
| 50 | SNMP | Managing and monitoring network devices. | Getting status from a router. |

---

## Attack and malware (51-75)
*The weapons and tactics of the adversary.*

| No. | Concept | Interview Answer | Example / Tool |
|---|---|---|---|
| 51 | Malware | General "Malicious Software." | Viruses, Worms, Trojans. |
| 52 | Virus | Replicates only when a user runs the file. | Attaches to an .exe. |
| 53 | Worm | Self-replicates and spreads automatically across networks. | WannaCry. |
| 54 | Trojan | Disguises itself as useful software to trick users. | Zeus banking trojan. |
| 55 | Ransomware | Encrypts files for a payout. | Colonial Pipeline breach. |
| 56 | Spyware | Secretly monitors user activity. | Keyloggers, screen monitors. |
| 57 | Rootkit | Hides deep in the OS to maintain admin access. | Hiding from Task Manager. |
| 58 | Botnet | Network of infected "zombie" computers. | Mirai botnet. |
| 59 | Phishing | Social engineering via deceptive electronic messages. | Fake password reset emails. |
| 60 | Smishing/Vishing | Phishing via SMS or Voice/Phone calls. | "Your bank account is locked" SMS. |
| 61 | Social Engineering | Attacking the "Human element" to gain access. | Pretexting, tailgating. |
| 62 | SQL Injection | Inserting malicious SQL code into web forms. | Bypassing a database login. |
| 63 | XSS | Injecting client-side scripts into web pages. | Stealing session cookies. |
| 64 | CSRF | Forcing a user to perform an unwanted action. | Attacker "clicks" a delete button for you. |
| 65 | DDoS | Overwhelming a target with massive traffic. | Flooding a server to take it offline. |
| 66 | Man-in-the-Middle | Intercepting data between two parties. | ARP poisoning on public Wi-Fi. |
| 67 | Brute Force | Trying every password combination. | Script guessing a 4-digit PIN. |
| 68 | Dictionary Attack | Brute force using a list of common words. | rockyou.txt wordlist. |
| 69 | Rainbow Table | Pre-computed hash table to crack passwords fast. | Cracking weak MD5 hashes. |
| 70 | Salt | Adding random data to passwords before hashing. | Preventing rainbow table attacks. |
| 71 | Zero-Day | Exploiting a flaw before a patch exists. | Log4Shell. |
| 72 | Exploit | The code or method used to take advantage of a flaw. | Script used to gain access. |
| 73 | Payload | The "part" of the exploit that performs the harm. | The ransomware that runs after access. |
| 74 | Backdoor | A hidden method of bypassing security. | SSH access the attacker leaves behind. |
| 75 | Logic Bomb | Malicious code triggered by a specific event/time. | Admin deleting files if they get fired. |

---

## Response and defense (76-100)
*The strategy and operations to stop the hunt.*

| No. | Concept | Interview Answer | Example / Tool |
|---|---|---|---|
| 76 | SIEM | Centralized log correlation and alerting platform. | Splunk, QRadar. |
| 77 | SOC | Team that monitors and responds to alerts. | Triage and investigation. |
| 78 | EDR | Monitoring and responding to behavior on hosts. | CrowdStrike, SentinelOne. |
| 79 | DLP | Preventing sensitive data leaks. | Blocking credit card uploads. |
| 80 | IAM | Managing digital identities and permissions. | Okta, Azure AD. |
| 81 | SSO | Single login for multiple apps. | Logging in once for HR and Email. |
| 82 | MFA | Password + something you have/are. | Duo, YubiKey. |
| 83 | Vulnerability Mgmt | Identifying, prioritizing, and fixing flaws. | Nessus, Qualys. |
| 84 | Patch Mgmt | Updating software to fix vulnerabilities. | WSUS, Jamf. |
| 85 | Incident Response | Lifecycle of handling a security breach. | PICERL model (SANS). |
| 86 | Forensic Image | Bit-for-bit copy of a storage device for evidence. | Magnet AXIOM, EnCase. |
| 87 | Honeypot | Decoy system to distract/study attackers. | T-Pot modern honeypot. |
| 88 | BCP | Keeping the business running during disasters. | Disaster recovery plan. |
| 89 | RTO | Goal for how fast a system returns to normal. | "Back up in 2 hours." |
| 90 | RPO | Goal for how much data loss is acceptable. | "Lose no more than 1 hour." |
| 91 | SOC 2 | Trust report for service organizations. | Type I vs Type II. |
| 92 | ISO 27001 | International standard for security systems. | Maturity through certification. |
| 93 | NIST CSF | Voluntary framework for managing security risk. | Identify, Protect, Detect... |
| 94 | GDPR | EU privacy and data protection regulation. | Users can request data deletion. |
| 95 | HIPAA | US health data protection law. | Protecting medical records. |
| 96 | PCI DSS | Standard for payment card security. | Encrypting card data. |
| 97 | Blue Team | Internal defensive security group. | SOC Analysts. |
| 98 | Red Team | Internal/External offensive group (simulation). | Pentesting. |
| 99 | Purple Team | Collaborative Red + Blue engagement. | Tuning SIEM based on attacks. |
| 100 | Security Architecture | Building security into the foundation. | Zero Trust, SASE. |

*(Points 101-1200 continue in the quick-point categories. Use the navigation to move through each domain.)*
