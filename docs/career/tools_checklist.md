# 🛠️ SOC Tooling Checklist

What tools should you know? Every SOC is different, but they all use a common stack of defensive technologies. This checklist covers the industry standards.
{ .page-lead }

## 📊 SIEM (Security Information & Event Management)
The "Brain" of the SOC.
- [ ] **Splunk:** Search Processing Language (SPL), dashboards, and alert logic.
- [ ] **Microsoft Sentinel:** Kusto Query Language (KQL), workbooks, and playbooks.
- [ ] **IBM QRadar / LogRhythm:** Core log correlation and investigation modules.
- [ ] **ELK Stack (Elasticsearch, Logstash, Kibana):** Open-source log analysis and visualization.

## 🛡️ EDR (Endpoint Detection & Response)
The "Eyes" on the host.
- [ ] **CrowdStrike Falcon:** Process trees, RTR (Real Time Response), and Falcon Fusion.
- [ ] **SentinelOne:** Static vs dynamic detection, rollbacks, and binary verification.
- [ ] **Microsoft Defender for Endpoint:** Advanced hunting, device isolation, and timeline analysis.
- [ ] **Carbon Black:** Cloud-native endpoint visibility and control.

## 🕸️ Network Security & Analysis
- [ ] **Wireshark:** PCAP analysis, protocol disassembly, and flow graphing.
- [ ] **Zeek / Suricata:** Network-based IDS/IPS logging and rule writing.
- [ ] **Cisco Firepower / Palo Alto Networks:** Next-gen firewalls (NGFW) and App-ID rules.
- [ ] **Burp Suite:** Web application proxying and automated vulnerability scanning.

## 📧 Email & Phishing
- [ ] **Proofpoint / Mimecast:** Email gateway policies, rewritten URLs, and attachment sandboxing.
- [ ] **Microsoft Defender for Office 365:** Global purge, spoofing detection, and user impact analysis.
- [ ] **KnowBe4:** Phishing simulations and security awareness training.

## 🧪 Open Source & Investigation Tools
- [ ] **VirusTotal:** Hash, IP, domain, and URL reputation.
- [ ] **Cisco Talos Intelligence:** Global threat intelligence and reputation scoring.
- [ ] **Any.run / Hatching Triage:** Interactive malware analysis and sandboxing.
- [ ] **AbuseIPDB:** Community-driven IP reputation and blocklists.
- [ ] **MXToolbox / Urlscan.io / CyberChef:** The Swiss army knives for security analysts.
