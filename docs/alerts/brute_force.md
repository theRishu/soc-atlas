# 💪 Brute Force & Password Spray

Authentication attacks are among the most common alerts in any SOC. Understanding the difference between brute force, password spray, and credential stuffing — and knowing how to respond to each — is fundamental analyst knowledge.
{ .page-lead }

!!! note "Why authentication attacks matter"
    Compromised credentials are the leading cause of data breaches. Once an attacker has valid credentials, they appear as a legitimate user — meaning detection depends entirely on behavioral anomalies rather than clear malicious signatures.

---

## Attack Type Comparison

| Attack | Method | Detection Signal | Target |
|--------|--------|-----------------|--------|
| **Brute Force** | Try every possible password against one account | Many failures on one account | Single account |
| **Password Spray** | Try one or two common passwords against many accounts | Few failures spread across many accounts | Many accounts simultaneously |
| **Credential Stuffing** | Use username:password pairs from previous breaches against new services | Geographically dispersed logins, valid pairing success | Accounts reusing passwords |
| **Dictionary Attack** | Try passwords from a wordlist (common words, phrases) | High failure rate but successful on weak passwords | Single or multiple targets |

---

## What to Check (SOC L1 Checklist)

| Priority | Field | What You Are Looking For |
|----------|-------|--------------------------|
| 🔴 First | **Failure count and pattern** | Many failures = brute force; spread across accounts = spray |
| 🔴 First | **Was there a successful login after failures?** | Failures then success = likely compromised |
| 🟡 Second | **Source IP(s)** | Single IP (brute), many IPs (spray/stuffing), residential proxies |
| 🟡 Second | **Target accounts** | Admin/service accounts targeted? Elevated risk |
| 🟠 Third | **User agent and device** | Known browser vs. scripted user agent |
| 🟠 Third | **Geographic location** | Expected country/city or anomalous? |
| 🟠 Third | **Time pattern** | After-hours? Can indicate brute force automation |
| 🟢 Fourth | **Account lockouts triggered** | How many accounts were locked? |

---

## Investigation Workflow

### Phase 1 — Classify the Attack (2–3 minutes)

Run a SIEM query to understand the pattern:

- **One account + many failures** → Brute Force
- **Many accounts + few failures each** → Password Spray
- **Many accounts + pre-existing username:password pairs + global source IPs** → Credential Stuffing
- **Failures then success** → Active compromise — escalate immediately

### Phase 2 — Investigate Successful Logins

If any authentication succeeded:
- **When was the last successful login before this event?** (Baseline for the account)
- **What device and location did the successful login come from?** (Compare to the account's normal pattern)
- **What did the account do after logging in?** (Check activity logs for mailbox rules, data access, admin actions)
- **Did any MFA challenge occur and was it approved?** (MFA fatigue/bypass?)

### Phase 3 — Containment

| Scenario | Action |
|----------|--------|
| Brute force still in progress | Block source IP at firewall/WAF, lock the targeted account |
| Password spray in progress | Block source IP range, reset all targeted accounts' sessions |
| Successful compromise confirmed | Disable account, revoke sessions/tokens, force password reset, enable MFA |
| Service account targeted | Alert the application team, rotate service account credentials |

---

## Interview Questions & Answers

**Q1. What is the difference between brute force and password spray?**

> "Brute force attacks try every possible password combination against a single account until the correct one is found. This triggers account lockout policies quickly — which is why it's often detected and blocked. Password spray works the opposite way: the attacker tries one or two very common passwords — like 'Password123' or 'Welcome1' — against hundreds or thousands of accounts simultaneously. Because each account only receives one or two failed attempts, spray attacks stay below lockout thresholds and are much harder to detect with traditional alerting."

**Q2. What is credential stuffing?**

> "Credential stuffing uses username and password pairs stolen from previous data breaches and tests them against other services, exploiting the fact that many people reuse passwords across multiple sites. If someone used the same email and password on LinkedIn and their corporate VPN, and the LinkedIn credentials were in a breach dump available on dark web markets, an attacker can automate millions of login attempts against enterprise portals. Unlike brute force, credential stuffing uses valid credentials — so the failure rate is much lower and each 'success' is a real account."

**Q3. How do you detect password spray in a SIEM?**

> "I write a query that looks for authentication failures distributed across many different accounts from the same source IP or small IP range within a defined time window — for example, more than 20 distinct user accounts with failed logins in 10 minutes. The key signature of spray is: wide breadth across accounts, low depth per account. I also look for the timing pattern — spray attacks often have a regular interval between attempts to avoid triggering rate limits, so I look for machine-like cadence. In Microsoft Sentinel I can use the 'Password Spray' detection template, and in Splunk there are pre-built SPL queries for this pattern."

**Q4. What is an account lockout policy and what are its limitations?**

> "An account lockout policy automatically disables a user account after a set number of failed login attempts — typically 5–10 — within a time window. It's an effective defense against brute force attacks but has significant limitations: password spray attacks are specifically designed to stay below the lockout threshold. Additionally, lockout policies can be abused as a denial-of-service mechanism — an attacker can deliberately lock out all accounts in an organization, including admin accounts, by sending just enough failed attempts."

**Q5. What is MFA fatigue (also called MFA push bombing)?**

> "MFA fatigue is a social engineering attack targeting push notification-based MFA systems like Duo or Microsoft Authenticator. The attacker obtains the user's password through phishing or breach data, then logs in repeatedly, triggering a barrage of push notifications asking the user to 'Approve' or 'Deny'. After receiving many notifications, often in the middle of the night, the user eventually approves one just to stop the notifications — granting the attacker access. Mitigations include: number matching (the app shows a code the user must match to the login screen), additional context on push notifications, and switching to phishing-resistant FIDO2/hardware keys."

**Q6. What is a distributed brute force attack and how does it evade detection?**

> "A distributed brute force attack uses many different source IPs — typically from a proxy network, cloud provider exit nodes, or a botnet — to conduct the attack, so each source IP makes only a small number of attempts. This evades traditional rate-limiting and IP-based lockout rules. Detection requires looking at the target-side pattern: many failed attempts against the same account from many different IPs, which is the inverse of normal spray detection. Device fingerprinting, behavioral analytics, and user entity behavior analytics (UEBA) are more effective than IP-based controls here."

**Q7. What logs do you need to investigate a brute force or spray attack?**

> "I need authentication logs from all relevant sources: Active Directory authentication events (Event IDs 4625 for failed logins, 4624 for success), Azure AD / Entra ID Sign-In logs if in a cloud environment, VPN authentication logs, web application authentication logs, and mail portal (OWA/Outlook) access logs. I correlate these in the SIEM, looking for the pattern and identifying the source IP, targeted accounts, and any successful authentications in the attack window."

**Q8. How do you respond when you see 'failures then success' in the logs?**

> "Failures followed by a successful login is one of the highest-confidence indicators of a compromised account. I immediately disable the account and revoke all active sessions and tokens. Then I investigate what the account did after the successful login: what files were accessed, what emails were read, any inbox rules created, and any admin actions taken. I check where the successful login came from — IP, location, device — and compare it to the account's normal baseline. If activity looks malicious, I treat it as an active incident and escalate to L2."

**Q9. What is the UEBA (User and Entity Behavior Analytics) role in detecting these attacks?**

> "UEBA builds a baseline of normal behavior for each user and entity — typical login times, locations, devices, and access patterns. When a login occurs at 2AM from Romania for an account that always logs in from London 9-to-5 on a Windows machine, UEBA flags it as anomalous and generates a high-risk alert even if the credentials were correct. This is critical for catching credential stuffing and spray attacks that succeed, because after a successful login the activity patterns are the only remaining indicator of compromise."

**Q10. What is a rainbow table attack?**

> "A rainbow table is a precomputed table of plaintext passwords and their corresponding hashes, used to reverse hash-to-password lookups very quickly. Instead of computing hashes on the fly (brute force), the attacker simply looks up the captured hash in the table. Rainbow tables are effective against unsalted hashes but completely defeated by password salting — adding a unique random value to each password before hashing means the same password produces a different hash for every user, making precomputed tables useless."

**Q11. What is credential harvesting vs. credential stuffing?**

> "Credential harvesting is the act of stealing credentials — typically through phishing portals, keyloggers, or man-in-the-browser malware that captures them at input time. The result is a collection of username-password pairs. Credential stuffing is what happens next — those harvested credentials are tested against other services in bulk. One is the collection method; the other is the exploitation phase."

**Q12. What controls would you recommend to prevent brute force and spray attacks?**

> "Defense in depth: First, enforce MFA — especially phishing-resistant FIDO2 or certificate-based authentication — which makes stolen passwords alone insufficient. Second, implement conditional access policies that evaluate device compliance, location, and risk signals before granting access. Third, configure smart lockout policies that lock accounts from suspicious IPs while allowing legitimate logins. Fourth, monitor authentication logs with behavioral analytics and alert on spray patterns. Fifth, use a password audit tool to proactively identify accounts with weak or breached passwords and force resets."

---

!!! success "Very Short Version (Easy to Remember)"
    - **Brute force**: many failures on ONE account → lockout expected
    - **Spray**: few failures on MANY accounts → stays below lockout threshold
    - **Stuffing**: valid breach-data pairs tested → low failure rate, global IPs
    - **Key alert**: failures THEN success = active compromise → immediate response
    - **Contain**: block source IP, revoke sessions, force password reset, enable MFA
    - **Detect spray with SIEM**: many distinct accounts + failures + same IP range in short window
