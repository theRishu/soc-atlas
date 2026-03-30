# 📤 Data Exfiltration Alert

Data exfiltration is the unauthorized transfer of sensitive data from an organization to an attacker-controlled destination. It is often the final and most damaging phase of an attack — but it can also happen through insiders. Detecting it early limits the blast radius significantly.
{ .page-lead }

!!! note "Exfiltration is often the last phase"
    In the MITRE ATT&CK framework, exfiltration (TA0010) follows collection (TA0009). By the time data is leaving, the attacker has already achieved persistence, elevated privileges, and has been in the environment for days or weeks. Context and speed of response matter enormously.

---

## Common Exfiltration Techniques

| Method | Description | Detection Signal |
|--------|-------------|-----------------|
| **HTTP/HTTPS upload** | Data sent to external web service or C2 | Large POST/PUT requests to unknown domains |
| **DNS tunneling** | Data encoded in DNS query names | Abnormally long or high-volume DNS queries |
| **Cloud storage** | Upload to Dropbox, Google Drive, OneDrive | DLP alert or proxy block on cloud storage |
| **Email exfiltration** | Bulk emails with attachments to personal addresses | DLP email alert, attachment volume spike |
| **FTP/SFTP** | Data transferred to external FTP server | Outbound FTP traffic — rarely legitimate |
| **Removable media** | Copied to USB stick or external drive | Endpoint DLP alert on device write |
| **Steganography** | Data hidden inside images or media | Very hard to detect — needs behavioral context |
| **Scheduled transfer** | Automated nightly data dumps from internal tools | Large egress traffic occurring at consistent off-hours intervals |

---

## What to Check (SOC L1 Checklist)

| Priority | Check | Details |
|----------|-------|---------|
| 🔴 First | **Volume of data transferred** | How many MB/GB? Compare to baseline for this user/host |
| 🔴 First | **Destination** | External IP? Cloud storage? Personal email? Unknown domain? |
| 🟡 Second | **What data was transferred?** | DLP classification — PII, financial, health records, source code? |
| 🟡 Second | **Method of transfer** | HTTP POST? DNS? FTP? Email? Removable media? |
| 🟠 Third | **Was this authorized?** | Is there a business justification? Check with the data owner |
| 🟠 Third | **User behavior baseline** | Is this normal for this user's role and work patterns? |
| 🟠 Third | **Time pattern** | Overnight? Weekend? Off-hours suggests malicious automation |
| 🟢 Fourth | **Is an insider threat possible?** | User recently passed notice period? Disciplinary action? |

---

## Investigation Workflow

### Phase 1 — Quantify and Classify

- How much data moved? (bytes transferred)
- What type of data? (DLP classification labels — PII, Financial, Health, IP)
- Who performed the transfer? (username, source host)
- Where did it go? (IP/domain, country, cloud service)

### Phase 2 — Investigate the Source

- Review the file access logs for what the user or process accessed before the transfer
- Check if files were staged to a temp directory before exfiltration (`%TEMP%`, `Downloads`, a hidden folder)
- Review EDR for any compression or archiving activity (7zip, WinRAR, `zip`, `tar`)
- Check if credentials were used to access file shares to collect data first

### Phase 3 — Investigate DNS Tunneling (if suspected)

DNS tunneling encodes data in DNS query subdomains — each query carries a few bytes of exfiltrated data:

- Look for DNS queries with very long subdomain names (> 50 characters)
- Look for very high query frequency to the same domain (hundreds per minute)
- Look for Base64 or hex characters in subdomain labels
- Check the query type — TXT records often used for tunneling
- Tools: `iodine`, `dnscat2`, `DNSExfiltrator` are known tunneling implementations

### Phase 4 — Contain

- Block the destination IP/domain at the proxy and firewall
- Revoke the user's access (if insider) or isolate the compromised host (if attacker)
- Notify the DLP team and Data Protection Officer (GDPR/regulatory implications)
- Preserve all relevant transfer logs for forensic and legal purposes

---

## Interview Questions & Answers

**Q1. How do you investigate a data exfiltration alert?**

> "I start by quantifying the event — how much data was transferred, to where, by whom, and through what method. I check the DLP tool or proxy logs for the classification of data involved — was it PII, financial records, health data, or intellectual property? Then I investigate the source: did the user or process first access file shares to collect data, stage it in a temp folder, compress it, and then transfer it? That staging pattern is a strong indicator of intentional exfiltration. I also check whether the transfer was authorized. Based on whether it's an insider threat or external attacker, the containment response differs."

**Q2. What is DNS tunneling and how do you detect it?**

> "DNS tunneling exploits the DNS protocol to transfer data by encoding it into DNS query names. Because organizations almost always allow DNS traffic outbound for name resolution, it's a reliable channel for bypassing firewalls. The attacker runs a DNS server for a domain they control. The malware on the victim's machine sends DNS queries whose subdomain labels contain Base64-encoded chunks of data — for example `eHh4eHg=.evil.com`. The DNS server extracts and reassembles the data. Detection signals include: DNS queries with unusually long subdomains (>50 characters), high-volume queries to a single domain, use of TXT or NULL query types, and domains with high entropy names."

**Q3. What is a DLP tool and what can it detect?**

> "DLP — Data Loss Prevention — is a control that monitors and can block the movement of sensitive data based on classification rules. It inspects content for patterns matching defined sensitive data types: credit card numbers, social security numbers, healthcare identifiers, API keys, passport numbers, source code patterns and more. DLP can be deployed at the endpoint (monitoring file copies and USB writes), on email gateways (scanning attachments and email body), on proxies (inspecting HTTP/HTTPS uploads), and in cloud environments (Microsoft Purview, Netskope, Symantec DLP). When DLP fires, it tells you data classification, user, destination, and action taken."

**Q4. How does an attacker stage data before exfiltration?**

> "Staging is collecting and preparing data in a convenient location before the final transfer. Common staging steps include: using PowerShell or batch scripts to copy specific files matching patterns (*.docx, *.xlsx, *.sql) from file shares to a local directory; compressing and encrypting the archive with 7-Zip or WinRAR to reduce size and obscure content; renaming the archive to something innocuous; and then transferring it. Detecting staging means looking for: bulk file read operations on file shares from a single account, large archive creation in temp directories, `7z.exe` or `rar.exe` execution with command lines, and then outbound data transfer shortly after."

**Q5. What makes data exfiltration via HTTPS hard to detect?**

> "HTTPS encrypts the payload, so traditional DLP and proxies cannot inspect the content of transfers without SSL inspection (TLS inspection/break-and-inspect). Even with SSL inspection, data uploaded to legitimate file-sharing services like Google Drive, Dropbox, or OneDrive looks like normal cloud storage usage. Detection depends on behavioral analysis: volume anomalies (much more data than this user normally uploads to cloud services), off-hours uploads, uploads from processes that shouldn't be doing network transfers, and CASB tools that have API access to cloud services to inspect what was actually uploaded."

**Q6. What is the MITRE ATT&CK exfiltration tactic and its sub-techniques?**

> "The Exfiltration tactic (TA0010) in MITRE ATT&CK describes how attackers transfer data out of a compromised environment. Key sub-techniques include: T1041 — Exfiltration Over C2 Channel (data embedded in the same C2 beaconing traffic); T1048 — Exfiltration Over Alternative Protocol (DNS, ICMP, SMTP tunneling); T1052 — Exfiltration Over Physical Medium (USB drives); T1567 — Exfiltration to Cloud Storage (Dropbox, OneDrive, GitHub); and T1020 — Automated Exfiltration (scheduled automated transfers). Understanding which technique is being used guides your detection and containment strategy."

**Q7. What is the difference between an insider threat and an external attacker exfiltrating data?**

> "An insider threat involves a current or former employee, contractor, or partner acting intentionally or accidentally to remove sensitive data for personal gain, revenge, or on behalf of a competitor. Signs include: the user recently resigned or was disciplined, large data transfers correlating with the resignation date, transfers to personal email or cloud storage, access to data outside their normal work scope. An external attacker using a compromised account shows similar behavior but typically after a period of reconnaissance, with the compromised account accessing data the user would not normally touch, using automation, and often communicating with external C2 infrastructure."

**Q8. What GDPR/regulatory implications follow a confirmed data exfiltration?**

> "Under GDPR, organizations must notify the relevant supervisory authority within 72 hours of becoming aware of a personal data breach that risks individuals' rights and freedoms. If individuals' rights and freedoms are at high risk, those individuals must also be directly notified. For US-based organizations, breach notification requirements vary by state (CCPA in California) and by sector (HIPAA for healthcare, GLBA for financial services). As a SOC analyst, I am not making those legal decisions — but I escalate immediately to the DPO and legal team with the full scope of what data was exfiltrated, from where, and to what destination."

**Q9. How can you detect bulk file access that might precede exfiltration?**

> "I look for file access anomalies in Windows Security Event logs (Event ID 4663 — Attempt to Access Object, with object access auditing enabled) or in file server audit logs. The pattern of staging is: one user account, in a short period, reading a very large number of files — especially across multiple folders or file shares that span beyond their normal work scope. In SIEM, I can write a query counting unique file access events per user per hour and alert when a user exceeds a threshold that's multiple standard deviations above their historical baseline. UEBA tools do this automatically."

**Q10. What role does a CASB play in detecting exfiltration?**

> "A CASB — Cloud Access Security Broker — sits between users and cloud services, giving visibility and control over data flowing from the organization into cloud applications. A CASB can: detect when a user uploads more data to Dropbox in one hour than they normally do in a week; alert when data classified as sensitive is uploaded to any personal cloud account; block uploads to unauthorized cloud services entirely; and for sanctioned services like SharePoint or Google Drive, use the cloud provider's API to scan what is actually being uploaded and apply DLP rules to the content. This is a critical control because purely network-based DLP cannot inspect HTTPS uploads without TLS inspection."

**Q11. Can data be exfiltrated through ICMP (ping)?**

> "Yes — ICMP tunneling encodes data in the data field of ICMP Echo Request or Reply packets. Tools like `ptunnel` and `icmpsh` implement this. Because many organizations allow ICMP outbound for diagnostics, it can bypass firewall rules that block TCP and UDP tunneling. Detection signals include: ICMP packets with unusually large data payloads (the data field of a normal ping is typically 32 bytes; tunneling sends much more), high volume of ICMP traffic to a single external destination, and ICMP traffic occurring in regular intervals suggesting automation. Network-level controls should apply rate limiting and maximum size restrictions to ICMP."

**Q12. What preventive controls reduce the risk of data exfiltration?**

> "Layered controls: Network DLP at the proxy to inspect and block sensitive content leaving via web. Email DLP to scan outbound attachments. Endpoint DLP to prevent USB writes and screen captures of sensitive documents. CASB for cloud app visibility and control. Egress filtering at the firewall — only allow outbound traffic on required ports to approved destinations (allowlisting). Monitoring and alerting on large data transfers, off-hours transfers, and DNS anomalies. User behavior analytics to establish baselines and alert on deviations. Removable media controls — block or encrypt all USB storage. Data classification so the most sensitive data has additional controls applied automatically."

---

!!! success "Very Short Version (Easy to Remember)"
    1. **Quantify first** — how much data, what type (DLP classification), to where
    2. **Check staging** — file bulk-read → archive (7zip) → transfer = deliberate exfil pattern
    3. **DNS tunneling signs** — very long subdomain queries, high frequency to same domain
    4. **DLP alert** = data type identified — PII, financial, health, source code
    5. **Insider vs. attacker** — recent resignation/discipline vs. compromised account behavior
    6. **72 hours** — GDPR breach notification window; escalate to legal/DPO immediately
    7. **CASB** = cloud exfil visibility; **Endpoint DLP** = USB/local control
