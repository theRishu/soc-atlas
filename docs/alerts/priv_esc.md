# 🔑 Privilege Escalation Alert

Privilege escalation is when an attacker — or malware — gains higher access rights than they initially had. It is a critical step in almost every serious attack: without escalated privileges, the damage an attacker can cause is limited. With them, the entire environment is at risk.
{ .page-lead }

!!! note "The two types of privilege escalation"
    **Vertical escalation**: Going from a lower privilege level to a higher one — standard user → local admin → domain admin → SYSTEM. **Horizontal escalation**: Accessing another account at the same privilege level but with access to different resources — using one employee's account to access another employee's files.

---

## Common Privilege Escalation Techniques

| Technique | Description | MITRE ID | Detection Signal |
|-----------|-------------|----------|-----------------|
| **Token Impersonation** | Stealing a high-privilege token from another process | T1134 | Unusual token manipulation API calls in EDR |
| **UAC Bypass** | Elevating from Admin (medium integrity) to High/SYSTEM without UAC prompt | T1548 | Known bypass binaries: `fodhelper.exe`, `eventvwr.exe` |
| **Kernel Exploit** | Exploiting OS kernel vulnerability to gain SYSTEM | T1068 | Unexpected kernel module load, process running as SYSTEM |
| **Unquoted Service Path** | Exploiting improperly quoted service executable paths | T1574 | Executable in unexpected location with elevated rights |
| **DLL Hijacking** | Placing a malicious DLL where a privileged process loads it | T1574 | Unexpected DLL load from writable path |
| **Sudo/SUID Abuse** | Exploiting misconfigured sudo rules or SUID binaries on Linux | T1548 | `sudo -l` followed by unexpected command execution |
| **Kerberoasting** | Extracting and cracking service ticket hashes to get service account passwords | T1558.003 | TGS-REQ events for many SPN accounts in rapid succession |
| **Pass-the-Hash** | Replaying NTLM hash to authenticate without knowing the plaintext | T1550.002 | Network auth from unusual source using hash instead of password |
| **Golden Ticket** | Forged TGT using KRBTGT hash — grants domain-wide persistence | T1558.001 | TGT with unusually long validity, non-existent PAC fields |
| **AS-REP Roasting** | Requesting encrypted credentials for accounts without Kerberos pre-auth | T1558.004 | AS-REQ to many accounts without pre-auth |

---

## What to Check (SOC L1 Checklist)

| Priority | Check | Details |
|----------|-------|---------|
| 🔴 First | **What privilege level was achieved?** | SYSTEM, Domain Admin, or Local Admin — each has different blast radius |
| 🔴 First | **Which account escalated?** | Service account? Standard user? Was base account already compromised? |
| 🟡 Second | **Technique used** | Token impersonation? UAC bypass? Kernel exploit? |
| 🟡 Second | **What happened AFTER escalation?** | Credential dumping, lateral movement, persistence creation? |
| 🟠 Third | **Which hosts are affected?** | One host or did the escalated account touch multiple systems? |
| 🟠 Third | **Was a domain admin compromised?** | If yes: escalate to Critical immediately |
| 🟢 Fourth | **Were any new accounts created?** | Check for backdoor admin accounts |

---

## Investigation Workflow

### Phase 1 — Understand the Escalation

- What was the starting privilege level of the process or account?
- What is the ending privilege level?
- What technique was used? Check MITRE ATT&CK Privilege Escalation tactic (TA0004)

### Phase 2 — What Did the Escalated Privilege Enable?

This is critical — the technique matters less than what was done with it:

- **Credential dumping**: LSASS access, SAM hive read, DCSync attack
- **Disabling security tools**: stopping EDR, removing AV, adding exclusions
- **Creating persistence**: new admin accounts, scheduled tasks, services, registry modifications
- **Lateral movement**: using elevated credentials to access other hosts
- **Ransomware staging**: escalation often precedes full ransomware deployment

### Phase 3 — Contain

- Isolate the affected host via EDR
- Revoke all sessions for the compromised account(s)
- If domain admin was touched: escalate to Critical — consider emergency KRBTGT password reset (invalidates all domain Kerberos tickets)
- Check for and remove all persistence mechanisms created post-escalation
- Check all other hosts the escalated account accessed

---

## Interview Questions & Answers

**Q1. What is privilege escalation and why does it matter in security?**

> "Privilege escalation is the process by which an attacker gains access rights beyond what was initially granted — moving from a standard user to local admin, from local admin to domain admin, or from a service account to SYSTEM. It matters because the initial foothold in most attacks involves limited access — a phishing email that compromises a standard user account has limited damage potential. But once the attacker escalates to admin or SYSTEM, they can dump credentials, disable security tools, move laterally across the entire network, and potentially compromise the entire Active Directory environment. Privilege escalation is the inflection point in an attack chain."

**Q2. What is the difference between vertical and horizontal privilege escalation?**

> "Vertical escalation means gaining higher privileges than your starting level — a standard user becoming a local admin, or a local admin becoming a domain admin. It's the classic 'climbing the privilege ladder'. Horizontal escalation means accessing another account at the same or similar privilege level but with access to different resources — for example, one standard user accessing another standard user's files or email. Horizontal escalation is often associated with data theft rather than full system compromise, and is particularly relevant in access control bypass scenarios."

**Q3. What is a UAC bypass and how does it work?**

> "User Account Control (UAC) is a Windows security feature that separates standard user and admin tokens even for accounts that are members of the Administrators group. When a high-privilege action is needed, UAC prompts the user to approve. A UAC bypass exploits specific auto-elevation behaviors in certain trusted Windows applications that are exempt from the UAC prompt. For example, `fodhelper.exe` reads a registry key before launching, which it does with elevated privileges. By writing a custom command to that registry key beforehand, a standard admin user can execute arbitrary code elevated to High integrity without any UAC prompt."

**Q4. What is token impersonation?**

> "Windows uses access tokens to identify the security context of a process — what account it runs as and what privileges it has. Token impersonation is a technique where a process steals or duplicates the token of a higher-privileged process and then runs new processes under that token's identity. The `SeImpersonatePrivilege` — often held by service accounts — enables this. Tools like JuicyPotato, RoguePotato, and PrintSpoofer exploit this privilege to escalate service accounts to SYSTEM. EDR detects this through monitoring of Windows API calls like `DuplicateTokenEx` and `CreateProcessWithTokenW` in unusual contexts."

**Q5. What is Kerberoasting?**

> "Kerberoasting targets service accounts in Active Directory. When a user requests a Kerberos service ticket for a service (TGS-REQ), the ticket is encrypted with the service account's NTLM hash. Any domain user can request service tickets for any service. An attacker extracts these tickets and cracks them offline — using Hashcat with a wordlist — to recover the plaintext service account password. Service accounts often have weak or non-expiring passwords, making them vulnerable. Detection: query logs show TGS-REQ events for many different Service Principal Names (SPNs) from one user in rapid succession — a pattern no legitimate user exhibits."

**Q6. What is a Golden Ticket attack?**

> "A Golden Ticket is a forged Kerberos Ticket Granting Ticket (TGT) created using the KRBTGT account's hash — the most sensitive credential in an Active Directory domain. Once an attacker has the KRBTGT hash (via DCSync or directly from a domain controller), they can fabricate TGTs for any user, with any group membership, valid for any duration. A Mimikatz-generated Golden Ticket can be valid for 10 years and include Domain Admin SIDs. The standard mitigation is to reset the KRBTGT password **twice** in succession to invalidate all outstanding TGTs domain-wide — though this is disruptive."

**Q7. What is DCSync and what privilege do you need to perform it?**

> "DCSync is a technique using Mimikatz that impersonates a domain controller and requests password hash replication data — the same data that legitimate DCs use to sync with each other — from the real domain controller. It extracts the NTLM hashes of every account in the domain, including the KRBTGT account, without requiring code execution on the DC itself. To perform DCSync, the account needs `DS-Replication-Get-Changes` and `DS-Replication-Get-Changes-All` rights, which are held by domain admins and certain backup/monitoring service accounts. DCSync is detected by monitoring 4662 events on Domain Controllers for replication rights being exercised by non-DC machine accounts."

**Q8. What Windows Event IDs indicate privilege escalation?**

> "Key Event IDs include: 4672 — Special privileges assigned to new logon (indicates a privileged account logged in); 4673 — A privileged service was called; 4674 — An operation was attempted on a privileged object; 4688 — Process creation with elevated integrity level; 4728/4732/4756 — Member added to security/admin groups; 4768/4769 — Kerberos TGT and service ticket requests (for Kerberoasting and Golden Ticket detection); 4964 — Special groups assigned to new logon (tracks sensitive group membership at login time). The combination of 4672 followed by 4688 (privileged login then process creation) from an unexpected user or host is particularly significant."

**Q9. What is Pass-the-Hash and how does it work?**

> "Pass-the-Hash (PtH) exploits NTLM authentication — which transmits a hash of the password rather than the plaintext — by replaying a previously captured NTLM hash to authenticate to a remote service without knowing the actual password. An attacker extracts a hash from memory using Mimikatz (`sekurlsa::logonpasswords`), then uses it to authenticate to SMB, RDP (NLA disabled), or other Windows services on other hosts. Mitigations: disable NTLM where possible, use Protected Users security group, deploy Credential Guard, enable SMB signing, and restrict lateral movement paths using local admin password solutions like LAPS."

**Q10. What is LAPS and how does it prevent privilege escalation?**

> "LAPS — Local Administrator Password Solution — is a Microsoft tool that automatically manages and rotates local administrator account passwords across domain-joined machines, setting a unique random password for each machine and storing it securely in Active Directory with access controls. Without LAPS, organizations often have the same local admin password on every machine — so compromising one machine gives admin access to all machines (lateral movement via Pass-the-Hash or same-credential reuse). LAPS breaks this by ensuring each machine has a unique, rotated local admin password."

**Q11. What is Sudo abuse on Linux and how do you detect it?**

> "On Linux, `sudo` allows specific users to execute commands as root or another user, governed by the `/etc/sudoers` configuration. Sudo abuse occurs when an attacker exploits an overly permissive sudoers rule or a vulnerability in a program that can be run via sudo to escalate to root. Common examples: `sudo vim` → `!sh` opens a root shell; `sudo find` with `-exec /bin/sh` spawns a privileged shell; misconfigured `NOPASSWD` rules requiring no password for privileged commands. Detection: `auth.log` or `journald` showing `sudo` invocations by unexpected users, `sudo -l` commands (listing available sudo rules is a reconnaissance step), and setuid binaries being executed in unusual ways."

**Q12. What is the first thing you do when you suspect domain admin compromise?**

> "I immediately escalate to the highest urgency — domain admin compromise is a Critical incident. My first priority is stopping ongoing damage: I work with the Active Directory team to **disable the compromised domain admin account and revoke all its Kerberos tickets**. If a Golden Ticket is suspected, I advise the team on performing **two sequential KRBTGT password resets** — the first ends ongoing use of existing tickets, the second ensures previously rotated tickets also cease to be valid. Then I analyze the scope: what other systems did this account access? Were any changes made to AD — new admin accounts added, GPOs modified, trust relationships changed? I preserve all relevant logs and escalate to incident response leadership."

---

!!! success "Very Short Version (Easy to Remember)"
    - **Vertical** = higher privilege level (user → admin → SYSTEM)
    - **Horizontal** = same level, different account's resources
    - **Post-escalation always matters more than the technique** — what did they do next?
    - **Golden Ticket** = forged TGT using KRBTGT hash → domain-wide persistence
    - **DCSync** = extract all hashes without touching DC — requires `DS-Replication` rights
    - **Kerberoasting** = crack service ticket hashes offline → service account passwords
    - **Domain admin compromised** = Critical escalation, KRBTGT reset ×2, full IR engagement
