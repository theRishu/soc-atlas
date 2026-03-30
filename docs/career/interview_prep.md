# 🎤 SOC Interview Readiness Guide

Interviewing for a SOC role is not about knowing everything — it is about demonstrating a **systematic investigative mindset**. You must prove you can follow a process, document your logic, and prioritize alerts correctly.
{ .page-lead }

## 🚦 Three Types of Interview Questions

| Category | Goal | Example Question |
|----------|------|------------------|
| **Fundamental Knowledge** | Test your grasp of the basics. | "What is the difference between TCP and UDP?" |
| **Scenario-Based** | Test your investigation process. | "We see 50 failed logins from an internal IP. What do you do?" |
| **Cultural/Behavioral** | Test your fit within a high-pressure team. | "Explain a time you were wrong about a security alert." |

## 🧪 The "Investigation Framework"
When asked a "What do you do?" question, NEVER start with containment. Always follow the **Triage → Investigation → Action** flow:
1. **Verify (Triage):** Check the source, destination, and severity. Is this a false positive or true positive?
2. **Contextualize (Investigation):** What is the source reputation? What is the user's role? What other alerts are firing around the same time?
3. **Analyze (Mechanism):** Look for patterns — PowerShell encoded strings, large data transfers, or connections to unauthorized IPs.
4. **Respond (Containment):** Isolate the host, disable the account, or block the IP *only after* verifying.

## 💼 Core Interview Questions (Quick Answers)

!!! tip "Use the SOCAtlas Pattern: Define, Mechanism, Example, Control"

- **"What happens when you type google.com?"**
    - `DNS` resolution → `TCP 3-way handshake` → `TLS/SSL handshake` → `HTTP GET` request.
- **"What is a SIEM?"**
    - A centralized platform for `Security Information` (log storage) and `Event Management` (real-time correlation and alerting). Example: Splunk, Microsoft Sentinel.
- **"Explain the OSI Model to a 5-year-old."**
    - It is like the levels of building a toy house — you need a `Foundation` (cables), `Frames` (switches), `Address` (IPs), and `Final Paint` (the app you see).

## 🆘 If You Don't Know an Answer
1. **Don't Guess:** Say "I haven't encountered that specific protocol/technique yet."
2. **Show Your Methodology:** "However, I would investigate it by checking [Documentation/Google/PCAP] and looking for [Indicators]." This shows you can solve unknown problems.
