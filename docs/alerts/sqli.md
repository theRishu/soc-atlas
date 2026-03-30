# 💉 SQL Injection (WAF Alert)

SQL injection remains one of the most critical and widespread web application vulnerabilities. A WAF alert for SQLi means someone is actively attempting to manipulate your database through user input. Every SOC analyst needs to understand this deeply.
{ .page-lead }

!!! note "What triggers a WAF SQLi alert?"
    A Web Application Firewall (WAF) inspects incoming HTTP requests for patterns matching known SQL injection payloads — quotes, SQL keywords (`UNION`, `SELECT`, `DROP`), comment sequences (`--`, `#`, `/**/`), and encoded variants. When a matching pattern is detected, the WAF logs the event and either **blocks** or **alerts** depending on the policy mode.

---

## SQL Injection Types

| Type | Technique | Example Payload |
|------|-----------|----------------|
| **Classic/In-band** | Error-based or union-based — results returned directly | `' UNION SELECT username, password FROM users --` |
| **Blind Boolean** | No output — infer data from True/False responses | `' AND 1=1 --` vs `' AND 1=2 --` |
| **Blind Time-based** | No output — use delays to infer data | `'; WAITFOR DELAY '0:0:5' --` |
| **Out-of-band** | Data sent to attacker-controlled server | DNS or HTTP callback with extracted data |
| **Second-order** | Payload stored, executed later in another query | Username saved with payload, used later in a different context |
| **Stacked Queries** | Multiple queries in one input | `'; DROP TABLE users; --` |

---

## What to Check (SOC L1 Checklist)

| Priority | Check | Details |
|----------|-------|---------|
| 🔴 First | **WAF action** | Was the request Blocked or did it Pass through? |
| 🔴 First | **HTTP response code** | Did the server return 200 (success) vs 400/500 (error)? 200 = potential success |
| 🟡 Second | **Payload content** | What SQL payload was sent? Manual or automated tool signature? |
| 🟡 Second | **Target endpoint** | Which URL parameter or form field was attacked? |
| 🟠 Third | **Source IP and frequency** | Single IP or distributed? Automated scan rate? |
| 🟠 Third | **User agent** | `sqlmap`, `Havij`, automated scanner vs real browser |
| 🟠 Third | **Volume of requests** | Automated scanning shows hundreds of attempts per minute |
| 🟢 Fourth | **Application server logs** | Did the database log any unusual queries around the same time? |

---

## Investigation Workflow

### Step 1 — Was the Attack Successful?

This is the most critical question. Check:

- **WAF action**: If "Block" — request never reached the app. Lower urgency
- **HTTP 200 response to injection payload**: The server processed and responded normally — **escalate**
- **Application/database error messages**: `SQL syntax error`, `ORA-`, `SQLSTATE` in response body = database touched
- **Response size anomaly**: If a response is much larger than baseline for that endpoint, UNION injection may have returned data

### Step 2 — Analyze the Payload

Understand what the attacker was trying to achieve:
- **Authentication bypass**: `' OR '1'='1` — trying to log in without a password
- **Data extraction**: `UNION SELECT` — trying to dump database tables
- **Database fingerprinting**: `@@version`, `user()`, `database()` — reconnaissance
- **Privilege escalation in DB**: `xp_cmdshell` (MSSQL), `LOAD_FILE` (MySQL) — OS command execution
- **Data destruction**: `DROP TABLE`, `DELETE FROM` — destructive attacks (rare but critical)

### Step 3 — Scope the Attack

- Is this a single URL or a full application scan? (High request volume = automated SQLMap)
- Did the attacker progress from simple probes to successful extraction?
- Are there successful authentication events to the app from the same IP around the same time?
- Were any database backup jobs, export operations, or unusual reads detected?

### Step 4 — Contain and Remediate

- If WAF blocked: block the source IP, review WAF rules for gaps
- If successful: **notify the application team immediately** — this is a data breach scenario
- Pull and preserve all web server and DB logs for forensics
- Identify and patch the vulnerable parameter in the application code
- Check for OS-level compromise (xp_cmdshell exploitation can lead to full server takeover)

---

## Interview Questions & Answers

**Q1. What is SQL injection and how does it work?**

> "SQL injection is a web application vulnerability where an attacker inserts malicious SQL code into user-controlled input fields — like login forms, search boxes, or URL parameters — that are not properly validated or sanitized. When the application builds a SQL query by concatenating the user input directly, the injected SQL code changes the structure of the query and is executed by the database engine. For example, a login form checking `SELECT * FROM users WHERE username='INPUT' AND password='INPUT2'` can be bypassed with the username `' OR '1'='1' --` which makes the WHERE clause always true and comments out the password check."

**Q2. What is the difference between a WAF block and an alert, and why does it matter?**

> "A WAF configured in 'block' mode determines the request matches an attack pattern and drops it before it reaches the application server — the attacker receives a 403 error. In 'detect' (alert-only) mode, the WAF logs the malicious request and raises an alert, but the request still passes through to the application. This matters enormously for incident response: if the WAF was in detect mode, the application received and potentially processed the injection payload — the attack may have succeeded. An HTTP 200 response to an injection payload in detect mode requires immediate investigation as a potential data breach."

**Q3. How do you determine if a SQL injection attempt was successful?**

> "I look for three indicators: First, the HTTP response code — a 200 response to an injection payload means the server processed the request without error, which is suspicious. Second, response body size anomaly — if a UNION injection worked, the response will be significantly larger than normal for that endpoint because extra database rows were returned. Third, application and database error messages in the response — while error messages usually indicate a failed injection attempt, they reveal the database type and query structure. I also check the database server's audit logs for unusual queries or large data reads occurring in the same window."

**Q4. What is a prepared statement and how does it prevent SQL injection?**

> "A prepared statement, also called a parameterized query, separates SQL code from user data at the database driver level. Instead of: `'SELECT * FROM users WHERE id=' + user_input`, a prepared statement sends the query structure first: `'SELECT * FROM users WHERE id=?'`, and then binds the user input as a typed parameter separately. The database engine then treats the bound data as literal data — never as executable code — regardless of what characters it contains. This completely prevents SQL injection because there is no path for the attacker's input to be interpreted as SQL syntax."

**Q5. What is SQLMap and what are the signs that it was used in an attack?**

> "SQLMap is an open-source automated SQL injection tool that systematically tests parameters for injection vulnerabilities and automatically extracts database data. Signs of SQLMap in WAF logs: the requests have a characteristic `*` injection marker pattern; there are hundreds or thousands of GET/POST requests to the same endpoint in sequence; the requests enumerate different SQL payloads in a recognizable progression (error-based, boolean-based, time-based); the User-Agent may contain 'sqlmap' (though attackers can change this); and the request timing follows an automated rather than human pattern. SQLMap usage is the equivalent of a locksmith testing every key on your lock."

**Q6. What is blind SQL injection and why is it more dangerous than classic injection?**

> "Classic SQL injection shows results directly in the response, making it easy to detect from error messages or extra data returned. Blind SQL injection extracts data without visible output, making it harder to detect. Boolean-blind injection works by asking the database yes/no questions: `' AND SUBSTRING(password,1,1)='a' --` — if true, the page loads normally; if false, the page changes, allowing the attacker to extract the password one character at a time. Time-based blind injection uses `SLEEP()` or `WAITFOR DELAY` — a time delay in the response confirms the condition was true. Blind injection is stealthier because the attacker doesn't need to see the output, but WAFs can still detect the payload patterns."

**Q7. What is the OWASP Top Ten and where does SQL injection rank?**

> "The OWASP Top Ten is a widely referenced list of the most critical web application security risks. SQL injection falls under 'A03:2021 – Injection', which includes SQL, NoSQL, OS, and LDAP injection attacks. Injection was ranked #1 for many years and remains in the top three. The OWASP Top Ten is the standard reference for web application security discussions and is tested in most application security certifications and interviews."

**Q8. Can SQL injection lead to full server compromise?**

> "Yes — in certain configurations, SQL injection can escalate to operating system access. On Microsoft SQL Server, the stored procedure `xp_cmdshell` executes operating system commands with the SQL Server service account's permissions. If the service account has elevated OS privileges, an attacker can use `xp_cmdshell` to run arbitrary OS commands — read files, create users, install malware, or establish persistence. This escalation path means an SQLi vulnerability on a poorly configured MSSQL database can become a full server compromise. MySQL's `LOAD_FILE` and `INTO OUTFILE` allow reading and writing arbitrary files if the DB user has FILE privileges."

**Q9. What does a WAF protect against and what are its limitations?**

> "A WAF protects against known web attack patterns — SQL injection, XSS, CSRF, directory traversal, command injection — by inspecting HTTP/HTTPS traffic against a ruleset. Its limitations include: WAF bypass techniques (encoding, obfuscation, HTTP parameter pollution) can evade signature-based rules; it cannot protect against business logic flaws, broken access control, or API abuse that doesn't match known patterns; and without TLS inspection it cannot see the content of HTTPS requests unless it terminates the TLS. A WAF is one layer — it doesn't replace secure application code. Parameterized queries in the code are the real fix; WAF is detection and a speed bump."

**Q10. What is second-order SQL injection?**

> "Second-order injection, also called stored SQL injection, occurs when a payload is safely stored in the database initially — either because input validation is applied on entry — but is later retrieved and used without sanitization in a different context where a SQL query is constructed. For example, a username `admin'--` might be stored safely, but when a passwordreset query is built using that stored username without parameterization, the stored payload executes. It's harder to detect than classic injection because the payload is harmless when inserted and only activates when retrieved and used in a vulnerable second query."

**Q11. What is NoSQL injection?**

> "NoSQL injection attacks target non-relational databases like MongoDB, CouchDB, or Redis by injecting operator expressions rather than SQL syntax. MongoDB queries use JSON-like operators. If an application builds a MongoDB query by concatenating user input: `{'username': userInput, 'password': passInput}`, an attacker can inject `{'$gt': ''}` as the password value to create the condition `{'password': {'$gt': ''}}` which matches any password — bypassing authentication. NoSQL injection is increasingly important to understand as more applications use document databases."

**Q12. What is a WAF bypass technique?**

> "WAF bypass techniques modify injection payloads to match the attacker's intent but evade the WAF's signature patterns. Common techniques include: URL encoding (`%27` instead of `'`); double URL encoding (`%2527`); case variation (`sElEcT` instead of `SELECT` against case-sensitive rules); comment obfuscation (`SE/**/LECT` — inline comments break keyword signatures); using alternate whitespace characters or newlines; HTTP parameter pollution (sending duplicate parameters); and using equivalent syntax (like `||` instead of `OR` in Oracle). Modern WAFs with ML-based detection are harder to bypass than purely signature-based rules."

---

!!! success "Very Short Version (Easy to Remember)"
    1. **WAF blocked?** → log, block IP, no breach. **WAF detected-only?** → investigate for success
    2. **HTTP 200 + injection payload** = potentially successful = treat as breach
    3. **Response size anomaly** = UNION injection may have dumped data
    4. **SQLMap signs** = hundreds of requests per minute, sequential payloads, automation pattern
    5. **Fix** = parameterized queries (prepared statements) — WAF is just a speed bump
    6. **xp_cmdshell** risk = SQLi on MSSQL with poor config → full OS compromise
    7. **OWASP A03:2021** = Injection — always in the top three web vulnerabilities
