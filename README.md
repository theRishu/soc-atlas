<div align="center">
  <h1>🛡️ SOCAtlas</h1>
  <p><b>The ultimate cybersecurity operations, alert playbook, and interview guide.</b></p>
</div>

<br>

Welcome to **SOCAtlas**, a comprehensive, open-source cybersecurity knowledge base. This repository holds highly structured playbooks, deep technical walkthroughs, and 1200 high-yield revision points designed specifically for Security Operations Center (SOC) Analysts, Security Engineers, and Infosec students.

## 🌐 View the Live Website
You do not need to download or install anything to read the documentation. You can view the fully interactive, hosted version of **SOCAtlas** directly in your browser right here:

👉 **[https://socatlas.vercel.app/](https://socatlas.vercel.app/)**
*(Backup: [https://theRishu.github.io/socatlas/](https://theRishu.github.io/socatlas/))*

---

## 🏗️ Local Setup

SOCAtlas is a Python-based static documentation site built with **MkDocs Material**. You do not need Node.js to run it locally.

### 1. Clone the repository
```bash
git clone https://github.com/theRishu/socatlas
cd socatlas
```

### 2. Create and activate a virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies
```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r deps.txt
```

---

## 💻 Run Locally

### Development mode with hot reload
Use this while editing markdown content. The site is served at `http://127.0.0.1:8087`.
```bash
sh dev.sh
# or
npm run dev
```

### Production preview on your machine
Use this when you want to preview the same static output that is deployed. This command builds the site into `./site` and then serves it locally on `http://127.0.0.1:8087`.
```bash
sh start.sh
# or
npm run preview
```

### Change the local port
All run scripts support a custom port:
```bash
PORT=3000 sh dev.sh
PORT=3000 sh start.sh
```

---

## 📦 Production Build

### Create the deployable static site
This generates the production output in the `./site` directory.
```bash
sh build.sh
# or
npm run build
```

### Deploy output
After the build finishes, deploy the contents of `./site` to your static hosting platform.

---

## 🔎 CLI Search

Search across the **1200 Quick Points** directly from your terminal:
```bash
./search.sh "firewall"
./search.sh "incident response"
# or
npm run search -- "firewall"
```

---

## ⚡ Command Reference

```bash
# one-time setup
git clone https://github.com/theRishu/socatlas
cd socatlas
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r deps.txt

# local development
sh dev.sh

# local production preview
sh start.sh

# production build
sh build.sh

# quick search
./search.sh "firewall"
```

---

## 🌟 Key Features
* **🚨 SOC Alerts & Playbooks:** Step-by-step triage, investigation, and containment workflows for EDR events, Malware, Ransomware, DDoS, Impossible Travel, and Privilege Escalation.
* **🏴‍☠️ Major Attacks Directory:** Clear technical breakdowns of critical attack vectors (SQLi, XSS, CSRF, SSRF, ARP Spoofing) mapped directly across the OSI Model.
* **⚡ 1200 Quick Points:** Rapid-revision concepts spanning Cloud Security, Cryptography, Defensive Frameworks (NIST/ISO), and SIEM tooling.
* **🌐 Security Fundamentals:** Beautifully structured breakdowns of the CIA Triad, Zero Trust architecture, and core network protocols.

---

## ☁️ Deployment & CI/CD
SOCAtlas is optimized for:
- **Vercel**: Serves the generated `site/` directory as a static deployment via `vercel.json` and `build.sh` with the framework preset forced to `Other`.
- **GitHub Pages**: Deployed via GitHub Actions to the `gh-pages` branch on every push to `main`.

---

## 🤝 Contributing
We believe that cybersecurity knowledge should be universally accessible. Whether it's adding new major attack walkthroughs, refining SOC alert triage steps, or expanding the quick revision points, pull requests are heavily encouraged!
