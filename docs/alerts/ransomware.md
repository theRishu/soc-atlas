# 🔒 Ransomware Attack

Ransomware is one of the most destructive and high-stakes incidents a SOC can face. Speed of containment in the first minutes directly determines how much damage is done.
{ .page-lead }

!!! danger "Ransomware is a CRITICAL severity incident"
    Modern ransomware attacks often involve **double extortion** — the attacker steals data first, then encrypts it, then threatens to publish stolen data if the ransom isn't paid. This means containment alone is not enough. Treat every ransomware incident as a full data breach.

---

## Recognizing a Ransomware Attack

| Indicator | Description |
|-----------|-------------|
| **Mass file rename** | Files suddenly have unfamiliar extensions (`.locked`, `.ryuk`, `.encrypted`) |
| **Ransom note** | Text files like `README.txt` or `HOW_TO_DECRYPT.html` appear on desktops |
| **EDR alerts** | Mass file modification, shadow copy deletion (`vssadmin delete shadows`) |
| **SIEM volume spike** | Thousands of file events in seconds from one process or user |
| **Network anomaly** | Unusual SMB traffic spreading laterally through file shares |
| **Disabled backups** | Backup agents killed, Windows VSS snapshots deleted |
| **Failed logins then success** | Credential compromise preceding encryption stage |

---

## Response Workflow (Time is Critical)

### Immediate Actions (First 5 minutes)

!!! danger "Priority ONE: Stop the spread"
    Every minute of hesitation allows the ransomware to encrypt more files and spread to more systems. Containment comes before investigation at this stage.

1. **Identify affected hosts** from EDR dashboard— look for mass file modification alerts
2. **Isolate affected hosts immediately** via EDR (CrowdStrike: Contain Host / SentinelOne: Network Quarantine)
3. **Alert your manager and the IR team** — this is an escalation, not something L1 handles alone
4. **Do NOT power off machines** — you preserve forensic evidence and active processes
5. **Check if domain controllers or file servers are affected** — if yes, escalate to CRITICAL immediately
6. **Identify the ransomware variant** from the ransom note or encrypted file extension (check: [ID Ransomware](https://id-ransomware.malwarehunterteam.com/))

### Short-term Investigation (Next 30–60 minutes)

- **Find Patient Zero** — which host was infected first? (earliest file encryption timestamp in EDR)
- **Determine initial access vector** — phishing email? Exposed RDP? Compromised VPN credentials? Unpatched vulnerability?
- **Check for data exfiltration BEFORE encryption** — review DNS logs, firewall egress for large data transfers to external IPs
- **Map the lateral movement path** — how did it spread? SMB, PsExec, stolen credentials?
- **Identify all compromised accounts** — revoke their sessions and reset credentials
- **Check backup integrity** — are offline/immutable backups safe and restorable?

### Eradication & Recovery

- Assume all affected systems are **untrustworthy** — rebuild from scratch, do not just remove the malware
- **Restore from the most recent clean backup** that predates the infection
- Monitor restored systems closely for signs of reinfection (the persistence mechanism may survive)
- **Before restoring**, identify and close the initial access vector so the attacker cannot re-enter

---

## Interview Questions & Answers

**Q1. How do you respond when a ransomware outbreak is detected?**

> "My first priority is immediate containment — stopping the spread before it hits more systems. I use the EDR to isolate every affected host from the network. If it's spreading rapidly across file shares or reaching domain controllers, I escalate to CRITICAL immediately and loop in the IR lead and management. Once I've stopped the spread, I begin the investigation: finding Patient Zero, identifying the initial access vector, and determining whether data was exfiltrated before encryption. Recovery comes only after we've secured clean backups and closed the entry point."

**Q2. What is 'double extortion' in a ransomware attack?**

> "Double extortion is a technique used by modern ransomware groups where they first steal sensitive data from the organization before deploying the encryption. They then demand two ransoms: one to get the decryption key, and one to prevent the stolen data from being published on a dark web leak site. Groups like REvil, LockBit, and Cl0p use this technique. It means even organizations with good backups face the threat of data exposure, which fundamentally changes the incident response strategy."

**Q3. What is Patient Zero and why do you need to find it?**

> "Patient Zero is the first system that was infected — the origin point of the attack. Finding it tells us the initial access vector: was it a phishing email that was clicked, an exposed RDP service brute-forced, a VPN credential stuffed, or a software vulnerability exploited? Once we know how the attacker got in, we can close that door before recovery to prevent immediate reinfection. Without finding Patient Zero, recovery is just resetting the clock on the same attack."

**Q4. Why do you NOT power off machines during a ransomware incident?**

> "Powering off a machine destroys volatile evidence — the contents of RAM, which may contain the decryption key, malware artifacts, active network connections, and running processes. It also makes forensic analysis harder because we lose the live state of the system. EDR network isolation is the correct approach: it cuts the host off from the network while preserving all local evidence for forensic investigation."

**Q5. How do you determine if backups are safe to use for recovery?**

> "First, I check whether the ransomware targeted backup infrastructure — many strains specifically kill backup agents (Veeam, Windows Server Backup) and delete Volume Shadow Copies using `vssadmin delete shadows /all /quiet`. I verify that the backup predates the initial infection timestamp identified by the EDR. I also check that backup media is offline or immutable — cloud-based immutable storage (like AWS S3 Object Lock or Azure Immutable Blob Storage) or offline tape backups are resistant to ransomware. Finally, I test the restore in an isolated environment before deploying to production."

**Q6. What is VSS shadow copy deletion and why is it significant?**

> "Volume Shadow Service (VSS) is a Windows feature that creates point-in-time snapshots of volumes — also called shadow copies. These are a fast local recovery method. Ransomware consistently deletes them as one of their first actions using the command `vssadmin delete shadows /all /quiet` or PowerShell equivalents, to prevent easy recovery without paying the ransom. Detecting this command execution in EDR or SIEM logs is a high-confidence indicator of ransomware activity and warrants immediate escalation."

**Q7. How does ransomware commonly gain initial access?**

> "The most common ransomware initial access vectors are: phishing emails with malicious attachments or links (especially macro-enabled Office documents), exposed RDP services on port 3389 brute-forced or using purchased stolen credentials, VPN vulnerabilities or stolen VPN credentials, software supply chain compromise (like SolarWinds), and exploitation of unpatched internet-facing systems like Exchange or Citrix. Knowing the vector allows us to close it before recovery."

**Q8. What is Ransomware-as-a-Service (RaaS)?**

> "RaaS is a business model where ransomware developers lease their malware toolkit to affiliate attackers through dark web portals in exchange for a percentage of ransoms collected — typically 20–30%. The developers handle malware updates and infrastructure; affiliates handle targeting, delivery, and negotiations. Groups like REvil, LockBit, and DarkSide operated as RaaS platforms. This model dramatically lowered the technical barrier to conducting ransomware attacks."

**Q9. What is lateral movement in the context of ransomware?**

> "Lateral movement is how the attacker spreads from the initially compromised host to other systems across the network before deploying ransomware. Common techniques include using stolen admin credentials to access file shares via SMB, using PsExec to remotely execute commands on other hosts, exploiting trust relationships between systems, using tools like BloodHound to map Active Directory and find paths to high-value targets like domain controllers and file servers. Detecting and stopping lateral movement is critical — ransomware deployed from a domain controller hits everything."

**Q10. What is the role of Active Directory in a ransomware attack?**

> "Active Directory is often the primary target during a ransomware attack because it controls authentication across the entire Windows environment. If an attacker compromises a domain admin account or the domain controller itself, they can push ransomware to every domain-joined machine using Group Policy, scheduled tasks, or PsExec at scale. This is why monitoring for unusual Domain Admin activity, Kerberoasting, and BloodHound-style enumeration is so critical in ransomware prevention."

**Q11. What is your communication plan during a ransomware incident?**

> "During a ransomware incident, communication needs to be structured and controlled. Internally: alert the SOC lead immediately, escalate to the IR team and CISO within the first 15 minutes, brief IT management on scope and impact. Externally: legal and compliance teams determine if breach notification obligations apply under GDPR, HIPAA, or other regulations. Avoid discussing the incident on potentially compromised channels — use out-of-band communication like a separate phone or emergency Slack instance. Definitive decisions about ransom payment involve executive leadership and legal counsel."

**Q12. Should an organization pay the ransom?**

> "This is a business and legal decision, not a SOC analyst decision. As an analyst, my job is to inform leadership of the facts: whether backups are viable, the scope of data stolen, which systems are affected, and the estimated recovery timeline both with and without a decryption key. Paying the ransom does not guarantee decryption, does not guarantee data won't be leaked anyway, and may violate OFAC sanctions if the ransomware group is a designated entity. The final decision rests with executive leadership and legal counsel."

**Q13. What indicators in SIEM logs suggest ransomware activity?**

> "Key SIEM indicators include: mass file rename or delete events in a short window, `vssadmin delete shadows` or `wmic shadowcopy delete` command execution, disabling Windows Defender via registry or PowerShell, stopping backup services like Veeam, large volumes of SMB connections from one host to many others (lateral movement), connections to known ransomware C2 infrastructure, and encoded PowerShell execution. These events in combination are high-confidence ransomware precursors."

---

!!! success "Very Short Version (Easy to Remember)"
    1. **Contain first** — isolate via EDR, not power-off
    2. **Identify variant** — ransom note, file extension, ID Ransomware
    3. **Find Patient Zero** — earliest infection timestamp = initial access vector
    4. **Check exfiltration** — was data stolen before encryption? (DNS/egress logs)
    5. **Verify backups** — offline/immutable only; confirm they predate infection
    6. **Rebuild don't repair** — wipe and restore, do not clean infected systems
    7. **Escalate everything** — this is never an L1-only incident
