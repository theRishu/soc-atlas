# 📧 Phishing & Email Threats

Phishing is the number-one initial access vector for cyberattacks — more breaches start with a malicious email than any other method. Knowing this playbook cold is essential for any SOC analyst.
{ .page-lead }

!!! note "What is Phishing?"
    Phishing is a social engineering attack using fraudulent emails that impersonate trusted entities — banks, HR, IT helpdesks, or executives — to trick recipients into clicking malicious links, opening weaponized attachments, or handing over credentials. Every SOC analyst receives phishing investigation tickets daily.

---

## Phishing Attack Types

| Type | Description | Example |
|------|-------------|---------|
| **Phishing** | Mass email campaign targeting many users | Fake Microsoft password reset |
| **Spear Phishing** | Targeted, personalized attack on a specific person | Email using victim's real name, role, recent activity |
| **Whaling** | Spear phishing targeting C-suite executives | Fake legal notice to a CFO requesting urgent wire transfer |
| **Vishing** | Voice-call phishing | "Microsoft Support" calling about an infected PC |
| **Smishing** | SMS-based phishing | Fake delivery notification with malicious link |
| **BEC** | Business Email Compromise — impersonating executives for financial fraud | Fake CEO email to Finance requesting payment to a new vendor |

---

## What to Check (SOC L1 Checklist)

| Priority | Field | What You Are Looking For |
|----------|-------|--------------------------|
| 🔴 First | **Did the user click or open anything?** | This is the most critical question — determines scope |
| 🔴 First | **Email headers** | True sender IP, SPF/DKIM/DMARC results, return path |
| 🟡 Second | **Embedded URLs** | Check each URL safely in URLScan.io, VirusTotal, or a sandbox |
| 🟡 Second | **Attachments** | Extract the hash and submit to VirusTotal / sandbox |
| 🟠 Third | **Proxy/DNS logs** | Did the user's device reach out to the malicious domain? |
| 🟠 Third | **EDR logs** | Did any attachment execute? What processes spawned? |
| 🟢 Fourth | **Scope check** | How many other employees received the same email? |

---

## Investigation Workflow

### Step 1 — Parse the Email Headers

Email headers reveal the true origin of an email. Open the raw headers and check:

- **Return-Path** / **From** — Do they match? If not, it's spoofed
- **Received: from** chain — Trace the actual originating IP address
- **X-Originating-IP** — Some mail servers add the true sender IP here
- **SPF result** — `PASS` means the sender IP is authorized; `FAIL` is suspicious
- **DKIM result** — `PASS` means the email body was not tampered with after signing
- **DMARC result** — The policy outcome — `Reject` or `Quarantine` are protective

Tools: Google Admin Toolbox, MXToolbox Header Analyzer, Azure Message Trace

### Step 2 — Analyze the Payload Safely

**For links:**
- Never click directly — use URLScan.io (paste the URL), VirusTotal URL scanner, or Browserling (remote browser)
- Check the domain age (new domain = high suspicion), certificate, and redirect chain
- Look for credential harvesting pages, fake login portals, or drive-by download patterns

**For attachments:**
- Extract the SHA-256 hash and check it on VirusTotal
- Submit to Any.run or Hybrid Analysis for dynamic sandbox detonation
- Check the file type (Office documents with macros, ISO files, ZIP files, LNK shortcut files)

### Step 3 — Determine User Interaction

This determines everything that follows. Query:

- **Proxy/web gateway logs** — Did the user's IP make a request to the malicious URL?
- **DNS logs** — Did the user's device resolve the malicious domain?
- **EDR logs** — Did any file download or execution occur after the email arrived?
- **Email gateway logs** — When was the email delivered? When was it opened?

### Step 4 — Contain Based on Impact

| If the user... | Your action |
|---------------|-------------|
| Did not open the email | Purge from mailbox globally and block sender domain |
| Opened the email but did not click | Purge, educate the user, no further action |
| Clicked a credential harvesting link | **Force password reset**, revoke all active sessions, enable MFA if not active |
| Opened a malicious attachment | **Isolate the host via EDR**, treat as active malware incident |
| Submitted credentials to a fake portal | **Emergency password reset**, check for unauthorized logins, enable MFA |

### Step 5 — Scope Check and Global Remediation

- Search the mail gateway for all recipients of the same email (same subject, sender, or attachment hash)
- Purge the phishing email from **all** affected mailboxes using admin tools (M365 Purge, Gmail Admin)
- Block the sender domain and the malicious URLs/IPs at the email gateway, proxy, and DNS filter

---

## Interview Questions & Answers

**Q1. How do you investigate a suspicious phishing email reported by a user?**

> "I start by pulling the raw email headers to identify the true originating IP, check the SPF, DKIM, and DMARC authentication results, and confirm whether the sending domain is legitimate or spoofed. Then I analyze the payload safely — I submit any URLs to URLScan.io and any file hashes to VirusTotal without directly clicking anything. The critical question I answer next is whether the user actually interacted with the email. I check proxy logs to see if their IP visited the URL, DNS logs for domain resolution, and EDR logs for any file execution. That interaction status determines the entire containment response."

**Q2. What are SPF, DKIM, and DMARC?**

> "All three are email authentication mechanisms. SPF — Sender Policy Framework — lists which IP addresses are authorized to send email for a domain. DKIM — DomainKeys Identified Mail — uses a cryptographic signature to prove the email body and headers weren't tampered with after sending. DMARC — Domain-based Message Authentication, Reporting and Conformance — ties SPF and DKIM together and tells receiving servers what to do when either check fails: monitor, quarantine, or reject. Together they dramatically reduce the success of email spoofing attacks."

**Q3. What is BEC (Business Email Compromise)?**

> "BEC is a sophisticated attack where the adversary impersonates a senior executive, vendor, or trusted partner to manipulate employees into taking financial or data-sharing actions. The most common scenario is a fake CEO or CFO email asking Finance to make an urgent wire transfer to a new bank account. BEC attacks often don't contain malware — they rely purely on social engineering and urgency. In 2022, BEC caused over $2.7 billion in losses according to the FBI IC3 report."

**Q4. What is the difference between phishing and spear phishing?**

> "Phishing is a bulk, opportunistic attack — the same email is sent to thousands of recipients hoping some percentage will click. Spear phishing is a targeted, personalized attack on a specific individual or organization. The attacker researches the target's name, role, colleagues, and recent activities (often via LinkedIn or social media) to craft a convincing, contextual message. Because it's personalized, spear phishing has a much higher success rate and is harder to detect with generic email filters."

**Q5. How do you safely analyze a suspicious URL without clicking it?**

> "I use URLScan.io — I paste the URL and it browses to it in a sandbox environment and gives me a screenshot, loading chain, redirects, and indicators. I also check the URL on VirusTotal's URL scanner which aggregates reputation from multiple threat intel vendors. For very targeted or novel phishing pages, I can use Browserling which allows me to interact with the page in an isolated remote browser. I never click the URL directly from an analyst workstation or the victim's machine."

**Q6. What is a credential harvesting page?**

> "A credential harvesting page is a fake login portal that looks identical to a legitimate service — Microsoft 365, Gmail, a corporate VPN, or a banking portal. When the victim enters their username and password, those credentials are captured by the attacker rather than authenticating to the real service. Modern harvesting kits, like Evilginx2, can also intercept MFA tokens in real time using a reverse proxy technique, bypassing traditional MFA."

**Q7. What do you do if a user entered their credentials on a phishing page?**

> "I immediately force a password reset for the compromised account and revoke all active sessions and refresh tokens (in M365 this is done with the 'Revoke Sessions' command in Entra ID). I check the signin logs for any unauthorized access that occurred between when the credentials were stolen and now. I verify MFA is enabled — if it wasn't, I enable it immediately. I also look for any email forwarding rules the attacker may have added to the mailbox to receive copies of future emails silently."

**Q8. How do you find how many users received the same phishing email?**

> "I search the mail gateway or email admin console using the sender address, subject line, attachment hash, or a distinctive URL fragment. In Microsoft 365, I use the Security & Compliance Center (now Microsoft Defender for Office 365) with Content Search or Threat Explorer. In Gmail, I use the Admin Console's BigQuery email audit logs or the Gmail search with `from:` and `subject:` operators. Once I identify all recipients, I use an admin purge operation to remove the message from all mailboxes simultaneously."

**Q9. What is a malicious attachment type most commonly seen in phishing?**

> "Historically, macro-enabled Office documents (.docm, .xlsm) were the most common. Attackers have adapted as Microsoft disabled macros by default — now the most common are: ISO and IMG disk image files (bypassed Mark-of-the-Web), ZIP archives containing LNK shortcut files that run PowerShell, HTML attachments with embedded JavaScript, and OneNote (.one) files with embedded executable attachments. The attack landscape shifts frequently as defenders add controls and attackers adapt delivery mechanisms."

**Q10. What is email spoofing?**

> "Email spoofing is the practice of forging the 'From' field of an email to make it appear as if it was sent from a trusted address — like payroll@company.com or ceo@company.com — when it actually originates from an attacker-controlled mail server. It exploits the fact that SMTP itself has no authentication built in. SPF, DKIM, and DMARC are the controls specifically designed to prevent spoofing, but they are only effective if the receiving domain enforces them."

**Q11. How do you handle a phishing email that has already been forwarded internally?**

> "If a user forwarded the phishing email to colleagues, I expand the scope of my investigation to include all recipients of the forwarded email. I check whether any of those secondary recipients also interacted with the payload. I search mail gateway logs for the original email and all forwarded copies. I purge the message from all affected mailboxes globally and notify all recipients not to click anything if they received it. The original reporter and all secondary recipients may need awareness follow-up."

**Q12. What is a QR code phishing attack (Quishing)?**

> "Quishing embeds a malicious URL inside a QR code rather than a clickable hyperlink. This is effective because email security gateways scan URLs in email text and attachments, but historically haven't decoded QR codes from embedded images to check the contained URL. The victim scans the QR code with their phone — often a personal device without corporate EDR — and is taken to a credential harvesting page. Modern email security tools now include QR code scanning and URL extraction to address this."

---

!!! success "Very Short Version (Easy to Remember)"
    1. **Headers first** — true sender IP, SPF/DKIM/DMARC = legitimate or spoofed?
    2. **Analyze payload safely** — URLScan.io for links, VirusTotal for attachment hashes
    3. **Did the user click?** — proxy/DNS logs, EDR logs = this determines everything
    4. **Credential submitted?** → force password reset + revoke all sessions
    5. **Attachment executed?** → isolate host via EDR → treat as malware incident
    6. **Purge from all mailboxes** — search by sender/subject/hash, admin-purge globally
    7. **Block sender domain** at email gateway, proxy, and DNS filter
