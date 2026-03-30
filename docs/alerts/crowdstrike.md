# 🛡️ CrowdStrike (EDR) Alert

CrowdStrike Falcon is the most widely deployed EDR platform in enterprise environments. Understanding how to read and respond to Falcon alerts is a daily skill for SOC analysts.
{ .page-lead }

!!! note "What is CrowdStrike Falcon?"
    CrowdStrike Falcon is a cloud-native Endpoint Detection and Response (EDR) platform that monitors endpoint behavior in real time, detects threats using AI/ML and intelligence-driven detections, and enables rapid response actions like host isolation and process termination — all without deploying signatures.

---

## CrowdStrike Alert Severity Levels

| Severity | Score | Meaning | Response |
|----------|-------|---------|----------|
| **Critical** | 90–100 | High-confidence malicious behavior, active threat | Immediate isolation and escalation |
| **High** | 70–89 | Suspicious behavior strongly associated with attacks | Investigate within 15 minutes |
| **Medium** | 40–69 | Potentially suspicious — context needed | Investigate within 1 hour |
| **Low** | 1–39 | Informational, likely benign | Log and review during normal triage |

---

## Key CrowdStrike Concepts

| Term | What It Means |
|------|--------------|
| **Detection** | A single behavioral event that CrowdStrike flagged |
| **Incident** | Multiple related detections grouped together |
| **Process Tree** | Parent-child hierarchy of processes at detection time |
| **Command Line** | The exact command string the process executed |
| **Indicators** | IOCs associated with the detection (hashes, IPs, domains) |
| **MITRE Tactic** | ATT&CK tactic category (e.g., Execution, Persistence) |
| **Contain Host** | Network isolation — cuts all external/internal networking while preserving console access |
| **Prevent** | Automatic prevention mode — Falcon blocked the threat |
| **Detect** | Alert-only mode — Falcon detected but did not block |

---

## What to Check (SOC L1 Checklist)

| Priority | Field | What You Are Looking For |
|----------|-------|--------------------------|
| 🔴 First | **Severity score** | Critical/High needs immediate attention |
| 🔴 First | **Detection action** | Prevented (blocked) or Detected-only (still running)? |
| 🟡 Second | **Process tree** | What spawned the flagged process? Legitimate parent? |
| 🟡 Second | **Command line** | What exact command ran? Encoded PowerShell? Tools? |
| 🟡 Second | **MITRE tactic/technique** | What stage of the attack chain is this? |
| 🟠 Third | **Network connections** | Is the process making outbound connections? To what? |
| 🟠 Third | **File writes** | Did the process write any files to disk? |
| 🟠 Third | **User context** | Which user ran this? Admin or standard user? |
| 🟢 Fourth | **Host details** | Is this a critical server, workstation, or shared machine? |

---

## Investigation Workflow

### Step 1 — Open the Detection in Falcon Console
- Navigate to **Activity → Detections** (or **Incidents**)
- Review the severity, detection name, MITRE tactic, and the **detection status** (Prevented vs. Detected)
- If "Detected" (not Prevented): the threat may still be active on the host

### Step 2 — Analyze the Process Tree
- The process tree is the most important piece of evidence
- Trace from the root parent down to the flagged process
- Common malicious patterns:
  - `winword.exe` → `powershell.exe` → `cmd.exe` (macro-based attack)
  - `explorer.exe` → `regsvr32.exe` → network call (LOLBin abuse)
  - `svchost.exe` → unexpected child process (process injection)

### Step 3 — Review Command Line Arguments
- Look for Base64-encoded strings: `-enc`, `-EncodedCommand`
- Download cradles: `Invoke-Expression`, `IEX`, `DownloadString`, `curl`, `certutil`
- Lateral movement: `psexec`, `wmic`, `net use`, `sc.exe`
- Credential access: `procdump`, `comsvcs.dll`, `sekurlsa`, `mimikatz`

### Step 4 — Check Network Activity
- In Falcon: go to the process and check **Network Connections**
- Look for connections to external IPs on unusual ports
- Look for DNS lookups to DGA (randomly-generated) domain names
- Check if the process established a persistent listener

### Step 5 — Decide: Contain or Investigate Further
- **If Critical/High AND "Detected" (not blocked)**: Contain the host immediately → **Right-click host → Contain Host**
- **If Prevented AND no lateral movement signals**: Investigate the root cause and tune policy if false positive
- **If unsure**: Escalate to L2 with the process tree screenshot and command lines

---

## Interview Questions & Answers

**Q1. How do you handle a CrowdStrike Falcon alert?**

> "I open the detection in the Falcon console and check four things first: the severity score, whether Falcon Prevented the threat or only Detected it, the MITRE tactic/technique to understand the attack stage, and the process tree to see what spawned the flagged process. If the detection is Critical or High and wasn't automatically prevented, I analyze the command line for malicious indicators — encoded PowerShell, download cradles, credential dumping tools. If I confirm it's malicious and active, I use Falcon's 'Contain Host' feature to isolate the endpoint while keeping console access for investigation. Then I escalate to L2 with the full timeline."

**Q2. What is the difference between CrowdStrike preventing vs. detecting?**

> "In CrowdStrike Falcon, 'Prevent' means the sensor automatically blocked the malicious action before it could execute — the threat was stopped. 'Detect' means the sensor saw and recorded the behavior and raised an alert, but did not actively block it. Detection-only mode is used when a policy is set to 'detect' rather than 'prevent' — often in environments where teams are careful about false-positive impact on operations. When a detection says 'Detected' and not 'Prevented', the threat may still be actively running, which makes it a higher urgency."

**Q3. What does 'Contain Host' do in CrowdStrike?**

> "Contain Host activates network isolation on the endpoint — it cuts the host off from all network communication, preventing lateral movement, C2 callbacks, and further exfiltration. Critically, it preserves the Falcon sensor's connection to the CrowdStrike Cloud, so the SOC analyst retains visibility into the host — can still see live telemetry, run Real Time Response commands, and investigate the endpoint remotely even while it's isolated. This is why EDR isolation is always preferred over physically unplugging the network cable."

**Q4. What is Real Time Response (RTR) in CrowdStrike?**

> "Real Time Response is CrowdStrike's remote shell capability. It gives SOC analysts a command-line interface to an endpoint — even while it's contained — to run forensic commands, collect artifacts, kill processes, delete files, or deploy scripts. RTR is used during active incident investigation when you need to collect evidence or remediate on a specific host. RTR sessions are recorded and audited. Common RTR commands include `ps` to list processes, `ls` to browse filesystem, `get` to pull files to the cloud, and `reg query` to examine registry values."

**Q5. What MITRE ATT&CK tactics might you see in a CrowdStrike detection?**

> "CrowdStrike maps every detection to a MITRE ATT&CK tactic and technique. Common ones include: Initial Access (T1566 Phishing, T1190 Exploit Public-Facing Application), Execution (T1059 Command and Scripting Interpreter — PowerShell/CMD), Persistence (T1053 Scheduled Tasks, T1547 Registry Run Keys), Privilege Escalation (T1055 Process Injection, T1134 Token Manipulation), Credential Access (T1003 OS Credential Dumping — LSASS), Lateral Movement (T1021 Remote Services — RDP/SMB/WMI), and Exfiltration (T1041 Exfiltration over C2 Channel)."

**Q6. What is a LOLBin and why does CrowdStrike flag it?**

> "LOLBin stands for 'Living Off the Land Binary' — legitimate Windows system executables that attackers abuse for malicious purposes because they are trusted by the OS and often permitted by security policies. Common LOLBins include PowerShell, certutil (download files), regsvr32 (execute DLLs), mshta (execute scripts), rundll32, wmic, and PsExec. CrowdStrike detects LOLBin abuse through behavioral patterns — for example, certutil being used to download an executable is unusual for a normal user and gets flagged as 'Suspicious Download'."

**Q7. What is process injection and how does EDR detect it?**

> "Process injection is a technique where malware injects malicious code into a legitimate process — like explorer.exe or svchost.exe — to execute under the legitimate process's identity and hide its activity. Common injection methods include DLL injection, process hollowing, and reflective DLL loading. EDR detects injection by monitoring Windows API calls involved in the process — if a process calls `VirtualAllocEx` in another process then writes code and executes it with `CreateRemoteThread`, that sequence is flagged as injection behavior regardless of what the injected code does."

**Q8. How do you analyze encoded PowerShell commands?**

> "Encoded PowerShell commands use Base64 encoding with the `-EncodedCommand` or `-enc` flag to obfuscate the actual command being run. To decode: I copy the Base64 string and decode it using PowerShell's `[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('BASE64HERE'))`, or I use CyberChef's 'From Base64' recipe followed by 'Decode text' as UTF-16LE — since PowerShell uses Unicode encoding. The decoded command might contain download cradles, persistence mechanisms, or credential theft code."

**Q9. What is LSASS dumping and why is it significant?**

> "LSASS — Local Security Authority Subsystem Service — is a Windows process that handles authentication and stores credential material in memory, including NTLM hashes and Kerberos tickets. Attackers dump LSASS memory to extract these credentials for subsequent lateral movement without needing to know plaintext passwords. Tools like Mimikatz, ProcDump, or the built-in comsvcs.dll MiniDump can perform this. CrowdStrike detects LSASS access attempts with high confidence — any process accessing LSASS memory with suspicious handles is flagged, typically as a Critical or High severity detection."

**Q10. What is a Falcon sensor policy and why does it matter?**

> "Falcon sensor policies control how the sensor responds to detections on endpoints within a group — whether it Detects only, Prevents automatically, or uses a custom combination. A policy set to 'Detect' means the sensor raises alerts but does not block. It's common for new deployments to start in 'Detect' mode to assess false positive rates before moving to 'Prevent'. As a SOC analyst, knowing the policy mode of a host tells you whether your alerts represent prevented threats or live active threats that need immediate response."

**Q11. How does CrowdStrike handle fileless malware?**

> "Fileless malware operates entirely in memory without writing executables to disk, making traditional file-based antivirus ineffective. CrowdStrike handles fileless attacks through behavioral detection — monitoring process behavior, API call sequences, memory allocation patterns, and network activity regardless of whether files are on disk. Techniques like PowerShell reflective loading, process injection into legitimate processes, and in-memory shellcode execution are detected through the behavioral engine. This is a core advantage of EDR over legacy AV."

**Q12. What would you look for if CrowdStrike detected a privilege escalation?**

> "I'd look at the process tree to understand which process triggered the privilege escalation, and what technique it used — common techniques are token impersonation (exploiting `SeImpersonatePrivilege`), UAC bypass (which elevates from standard admin to high integrity without a prompt), kernel exploits that grant SYSTEM privileges, or exploiting misconfigured services. I'd check what the process did after escalating — did it access sensitive files, create new admin accounts, disable security tools, or begin lateral movement? The 'after' is often more important than the technique itself."

---

!!! success "Very Short Version (Easy to Remember)"
    1. **Severity + action** — Critical/High AND Detected (not Prevented) = act now
    2. **Process tree** — trace parent → child, find the origin
    3. **Command line** — encoded PowerShell? Download cradles? Credential tools?
    4. **Network** — is it calling home (C2 callbacks, DNS to DGA domains)?
    5. **Contain Host** — network isolation, keeps Falcon console access active
    6. **RTR** — remote shell for forensic collection and on-host remediation
    7. **MITRE mapping** — tells you what stage of the attack you're looking at
