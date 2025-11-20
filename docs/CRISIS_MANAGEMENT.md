# D-A-I-R-A Crisis Management & Incident Playbooks

**Objective:** Prepare rapid response protocols for high-impact incidents  
**Scope:** Security, operational, legal, and reputational crises  
**Severity Levels:** P0 (system down) → P1 (major impact) → P2 (moderate) → P3 (minor)  

---

## 1. Crisis Severity Levels & Escalation

### P0: Critical System Outage

**Definition:** Platform completely unavailable OR major data loss

```
Examples:
├─ Database corrupt/deleted
├─ All servers offline
├─ 50%+ user data lost
└─ Payment processing failed for 24+ hours

Impact: 
├─ Revenue loss: ~$800-1000/hour
├─ User churn: 5-10% if >2 hours
├─ Legal liability: Possible
└─ Reputation: Severe

Response time: <15 minutes to acknowledge, <2 hours to resolve
```

**Escalation Chain:**
```
Trigger: System monitoring alert (automated)
↓
Page on-call engineer (SMS + call)
↓
If not resolved in 30min: Page DevOps lead
↓
If not resolved in 1 hour: Page CTO
↓
If not resolved in 2 hours: Page CEO + notify investors
↓
If not resolved in 4 hours: Go public with status page post
```

### P1: Major Feature Broken

**Definition:** Core feature unusable for >10% of users

```
Examples:
├─ Video uploads failing (100% of uploads)
├─ Feed doesn't load for iOS users (50% of traffic)
├─ Creator fund payouts stuck (5K creators can't cash out)
├─ Chat messages not delivering
└─ Authentication broken for specific regions

Impact:
├─ Revenue loss: $100-500/hour
├─ User frustration: High
├─ Churn: 1-2% if >4 hours
└─ Support tickets: 50-100/hour

Response time: <1 hour to acknowledge, <4 hours to resolve
```

### P2: Moderate Issue

**Definition:** Non-critical feature broken, impacting <10% of users

```
Examples:
├─ Search function slow
├─ Notifications delayed
├─ Some users see older feed
├─ Admin dashboard glitchy
└─ Image optimization errors

Impact:
├─ User inconvenience: Moderate
├─ Support tickets: 10-20/hour
└─ Churn: <0.5% if >24 hours

Response time: <4 hours to acknowledge, <24 hours to resolve
```

### P3: Minor Issue

**Definition:** Minor bugs or degraded performance

```
Examples:
├─ Typo in UI
├─ Button animation glitchy
├─ Page loads 500ms slower
├─ Obscure edge case bug
└─ Non-critical API slow

Impact: Minimal
Response time: <24 hours
```

---

## 2. P0: Critical System Outage Playbook

### Phase 1: Detection & Acknowledgment (0-5 minutes)

**Who:** On-call engineer (automatic alert → SMS + call)

**Checklist:**
```
□ Acknowledge alert (click "acknowledged" in monitoring tool)
□ Check all services:
  □ Backend API health (/health endpoint)
  □ Database connectivity (try query from bastion)
  □ Redis connectivity (check cluster status)
  □ Frontend CDN status (check Cloudflare dashboard)
  □ Video processing (check BullMQ jobs)
□ Check AWS/Heroku status pages for regional outages
□ Initial diagnosis: Is this our infrastructure or cloud provider?
□ Post in #emergency Slack channel: "INVESTIGATING: [Brief description]"
□ Set status page to "Investigating" (status.daira.app)
```

**First Message Template:**
```
In #emergency:
"🚨 P0: [Service] down
Symptoms: [What we're seeing]
Started: [When alert fired]
Investigating: [What we're checking]
ETA: [Best guess]
"
```

### Phase 2: Rapid Triage (5-15 minutes)

**Who:** On-call engineer + CTO (if not resolved in 10min)

**Triage Matrix:**
```
Is the problem on our infrastructure?
├─ YES: Go to "Our Infrastructure Failed" (below)
└─ NO: Is it cloud provider issue?
    ├─ YES: Go to "Cloud Provider Outage" (below)
    └─ NO: Go to "Data Corruption/Loss" (below)
```

**Our Infrastructure Failed**
```
Quick diagnostics:
├─ SSH to bastion host
├─ Check disk space: df -h (if 100% full, it's a disk space issue)
├─ Check logs: tail -100 /var/log/app.log | grep ERROR
├─ Check process status: ps aux | grep [app-name]
├─ Check memory: free -h (if <500MB available, OOM killed)
├─ Check network: ping 8.8.8.8 (network connectivity test)

If reboot solves it: REBOOT (with 30min downtime is better than 2hr investigation)
If not: Escalate to CTO
```

**Cloud Provider Outage**
```
Action:
├─ Verify on cloud provider status page (AWS, Heroku, etc)
├─ If confirmed outage: Prepare public statement
├─ Message: "We're experiencing a disruption due to [provider] outage.
           Working with them to restore service. ETA: [check status page]"
├─ Update status page every 30 minutes
└─ Nothing we can do except wait (unless we have failover region)
```

**Data Corruption/Loss**
```
PANIC MODE: Do NOT touch anything
├─ Stop application immediately (kill process)
├─ Take database backup NOW (if still accessible)
├─ SSH read-only to database (don't execute any writes)
├─ Check most recent backup:
│   ├─ When was it taken?
│   ├─ Is it intact?
│   └─ How much data would we lose if we restore?
├─ Call CEO immediately
├─ Assess: Restore from backup (1-2hr recovery, some data loss)
          vs. Investigate corruption (4-8hr investigation, possible full data loss)
└─ Decision: CEO calls the shot (restore vs investigate)
```

### Phase 3: Communication (Parallel with recovery)

**Who:** CEO (if P0 >30 minutes) or On-call engineer

**Status Page Update (Every 30 minutes during outage):**
```
Initial (5 min): 
"🔴 INVESTIGATING: Platform unresponsive. Our team is investigating the cause.
Last updated: [time]"

After 15 min:
"🔴 INVESTIGATING: We've identified [brief technical description]. 
Working to restore. ETA: ~15 minutes.
Last updated: [time]"

After 1 hour:
"🟡 DEGRADED: We're making progress. Expecting partial service in ~30 minutes.
Last updated: [time]"

After 2 hours:
"🟡 DEGRADED: We've made partial progress. Full restoration in ~30 minutes.
Users in [region] may still see delays.
Last updated: [time]"
```

**User Communication (If outage >1 hour):**
```
Post on homepage banner:
"⚠️ We're currently experiencing service disruptions. 
Our team is working to restore access. 
Check status.daira.app for updates."

Email to users (if email still works):
Subject: "D-A-I-R-A Service Disruption - We're Working on It"

Body:
"We experienced a service outage starting at [time]. 
Our technical team is actively working to restore full service. 
We apologize for the disruption and will update you hourly.
Latest status: [link to status page]"

Twitter/Public:
"We're aware of service disruptions affecting D-A-I-R-A users. 
Our team is investigating and working on a fix. Updates every 30 min on [status page]."
```

### Phase 4: Recovery & Monitoring (During fix)

**Who:** Engineering team + CTO

**Recovery Process:**
```
Step 1: Diagnose root cause
├─ Check logs for ERROR/FATAL messages
├─ Check metrics (CPU, memory, disk, network)
├─ Correlation: When exactly did the problem start?
│  └─ Cross-check with deployment logs
│     "Did we deploy something in the last hour?"
└─ If yes: Rollback deployment immediately

Step 2: Implement fix
├─ If infrastructure problem: Repair (restart service, free space, etc)
├─ If application bug: Rollback or fast hotfix
│  └─ Fast hotfix: Quick patch (30 min), test locally, deploy
│  └─ Rollback: Revert to last known-good version (5 min), less risky
├─ If external issue: Verify provider status, escalate if needed
└─ Always choose speed over perfection (fix now, optimize later)

Step 3: Verify recovery
├─ System health checks:
│  ├─ Backend API responding: curl http://api/health
│  ├─ Database queries working: SELECT COUNT(*) FROM users;
│  ├─ Redis connected: redis-cli PING
│  └─ Video processing queue: bullmq jobs pending
├─ User-facing tests:
│  ├─ Load homepage (check rendering)
│  ├─ Upload test video (check encoding)
│  ├─ Fetch feed (check data flow)
│  └─ Like/comment (check writes)
└─ All green? Service restored 🟢
```

**Monitoring During Recovery:**
```
Real-time dashboard during fix:
├─ Error rate (target: <0.1%)
├─ API response time (target: <200ms p99)
├─ Queue depth (BullMQ jobs backlog)
├─ Database connections
├─ Support ticket volume
└─ User session count (should increase as recovery progresses)

Red lines that trigger rollback:
- Error rate >5%
- Response time >5s p99
- Database unavailable
- More than 50 new error tickets/min
```

### Phase 5: Post-Incident (After recovery)

**Who:** CTO + On-call engineer + CEO

**Immediate (Within 1 hour):**
```
□ Update status page: "🟢 RESOLVED: [time]. Service restored.
    Root cause: [brief explanation]. We're continuing to monitor."

□ Send user email:
Subject: "D-A-I-R-A Service Restored"

Body:
"The service disruption that started at [time] has been resolved as of [time].
Root cause: [plain English explanation, not technical jargon]

Example: "A database disk became full, preventing new data writes. 
We've freed up space and verified all data is intact."

What we're doing:
- [Action 1]: Set up alerts for disk space (prevent future incidents)
- [Action 2]: Implement backup rotation (ensure quick recovery)
- [Action 3]: Post-mortem meeting (Tuesday) to prevent recurrence

We apologize for the disruption and appreciate your patience."

□ Notify investors (if Series A or later)
Subject: "Transparency: Service Incident Today"

Body:
"We experienced a [duration] service outage today starting at [time].
Root cause: [brief]
Actions taken: [brief recovery steps]
Post-mortem timeline: [when we'll have full report]
Impact: ~$[revenue loss], [user churn]%
We're implementing [safeguards] to prevent recurrence."
```

**Within 24 Hours:**
```
□ Conduct incident post-mortem (1-2 hours)
  ├─ Timeline: Exact sequence of events
  ├─ Root cause: What actually broke?
  ├─ Detection lag: When did we notice vs actual start?
  ├─ Resolution time: How long to fix?
  ├─ Root causes analysis:
  │  └─ Was this preventable? How?
  │  └─ Did we miss warning signs?
  │  └─ Was this a known risk?
  └─ Action items:
     ├─ Alert improvements (should we have caught this earlier?)
     ├─ Automation improvements (can we auto-fix in future?)
     ├─ Documentation (update runbooks for this scenario)
     └─ Owner + deadline for each action

□ Write incident report:
  - Share with team + investors
  - Transparency builds trust (especially after P0)

□ Update status page with incident report link
```

**Within 1 Week:**
```
□ Implement all action items from post-mortem
□ Add monitoring for this specific failure mode
□ Run incident scenario training (team practices response)
□ Update runbooks with lessons learned
```

---

## 3. P0: Security Breach Playbook

### Scenario: Unauthorized Access / Data Leak

**Definition:** Attacker accessed user database, posted malware, stole credentials

### Detection (Moment breach discovered)

**Who:** On-call engineer (security alerts) OR reported by user

**Immediate actions (First 5 minutes):**
```
□ Verify breach is real (check logs for evidence)
  ├─ Suspicious login: grep "failed attempts" /var/log/auth.log
  ├─ Unauthorized data export: check database audit logs
  ├─ Website defacement: check version control for unauthorized changes
  └─ Example: "CREATE TABLE attacker_backdoor" in database logs
  
□ If breach confirmed: ISOLATE AFFECTED SYSTEM
  ├─ Kill database connections (shut down app briefly)
  ├─ Isolate from internet (unless you can't)
  ├─ Turn off auto-backups (preserve evidence)
  └─ Do NOT clean logs (might lose forensic evidence)

□ Alert team immediately:
  Post in #emergency:
  "🚨 SECURITY BREACH DETECTED
  System: [Database/App/Mail]
  Time detected: [now]
  Immediate actions: [what we've done]
  Next steps: Activate security breach playbook"

□ Call CEO + lead investor immediately (breach is serious)
```

### Phase 1: Containment (First hour)

**Who:** CTO + Security lead (contractor if no in-house)

**Assess damage:**
```
Questions to answer IMMEDIATELY:
1. How did attacker get in?
   ├─ SQL injection? (upgrade input validation)
   ├─ Weak password? (force password reset)
   ├─ Compromised API key? (rotate all keys)
   ├─ Cloud provider compromise? (unusual, but check)
   └─ Answer: Look at access logs, git commits

2. What data was accessed?
   ├─ User emails? (PDPL breach notification required in 72h)
   ├─ Passwords? (force password reset for all users)
   ├─ Payment info? (highly regulated, serious liability)
   ├─ Creator content? (less critical, but still a breach)
   └─ Answer: Check database query logs + access patterns

3. How long was attacker active?
   ├─ Minutes? (narrow blast radius)
   ├─ Hours? (moderate damage)
   ├─ Days? (SERIOUS - possible ongoing access)
   └─ Answer: Correlate first unauthorized access with last

4. Is attacker STILL inside?
   ├─ Check for backdoors in code
   ├─ Check for unauthorized database users
   ├─ Check for scheduled jobs attacker created
   └─ If uncertain: Assume attacker is still inside until proven otherwise
```

**Immediate containment:**
```
□ Change ALL database passwords
  ├─ Rotate application DB credentials
  ├─ Rotate admin user credentials
  ├─ Rotate backup credentials
  └─ Deploy new credentials to app servers (restart services)

□ Rotate all API keys + secrets
  ├─ AWS access keys
  ├─ Database keys
  ├─ Payment processor keys (Fawry, etc)
  ├─ Email service keys
  └─ Deploy new keys (may cause brief service disruption)

□ Force password reset for all users
  ├─ Invalidate all existing sessions (users get logged out)
  ├─ Force re-login with new password on next access
  ├─ Notify users: "Security incident - please reset password"
  └─ This is disruptive but necessary if passwords compromised

□ Review access logs (since attack start time) for:
  ├─ Unusual data exports
  ├─ Large queries (attacker extracting data)
  ├─ Admin account access (attacker escalating privileges)
  └─ Backup access (attacker might have stolen backup)

□ Take snapshot of affected systems (for forensics)
  ├─ Don't run any cleanup or optimizations
  ├─ Preserve exact state for investigation
  └─ Might need this for law enforcement / regulators
```

**Decision: Downtime vs. Restoration**
```
If we can contain without downtime:
├─ Rotate credentials in background
├─ Users don't notice
├─ Keep service running

If we need downtime:
├─ Go offline for 1-2 hours
├─ Do full cleanup, verification
├─ Communicate clearly: "Security incident requires brief maintenance"
└─ Better safe than sorry (better 2hr downtime than ransomware running)
```

### Phase 2: Notification (24-72 hours)

**Who:** CEO + Legal + Communications

**PDPL Breach Notification (Required by law within 72 hours)**
```
If user data compromised:

Step 1: Report to PDPA (Egyptian authority)
├─ Contact: PDPA office in Cairo
├─ Provide: Description of breach, data affected, remediation steps
├─ Timeline: Within 72 hours of discovery
└─ Letter format:
   "On [date] at [time], we discovered unauthorized access to 
    D-A-I-R-A servers affecting [X] user records.
    
    Data compromised: [user emails, phone numbers, etc - be specific]
    Number of users affected: [X users]
    Likely cause: [SQL injection / weak password / etc]
    When discovered: [date/time]
    Corrective actions taken: [all mitigations above]
    
    We are notifying affected users and have implemented [safeguards]
    to prevent recurrence."

Step 2: Notify affected users
├─ Method: Email + SMS (so they see it)
├─ Timing: Within 72 hours of discovery
├─ Message template:

Subject: "Important: Security Incident Notification (Action Required)"

Body:
"We're writing to inform you of a security incident that may have affected 
your D-A-I-R-A account.

What happened:
On [date], we discovered unauthorized access to our servers. An attacker 
accessed user data including [list specifically: email, phone, birth date, etc].

What was NOT compromised:
[List what wasn't touched, to reassure]

What we're doing:
1. We've secured the system and rotated all security credentials
2. We've notified law enforcement and are cooperating with investigation
3. Your password has been invalidated - please reset it on next login
4. We recommend changing password on any other sites where you used 
   the same password

What you should do:
1. Change your D-A-I-R-A password immediately (forced on next login)
2. Change passwords on other sites (if you reused password)
3. Monitor your email/phone for suspicious activity
4. Consider credit freeze (if payment info was compromised)

We're providing 12 months free credit monitoring service [link]

We sincerely apologize for this incident and appreciate your patience
as we work to ensure this doesn't happen again."

Step 3: Prepare for media questions
├─ Press release: "D-A-I-R-A Addresses Security Incident" (see below)
├─ Contact 2-3 tech journalists with your version first (better than hearing from hackers)
└─ Be honest + transparent (lying about breach makes it worse)
```

### Phase 3: Investigation & Forensics

**Who:** External security firm + internal CTO

**Hire incident response firm** (if you don't have in-house expertise)
```
Cost: $5K-20K for full forensics
Timeline: 1-2 weeks for full report
What they do:
├─ Detailed timeline of attacker activity
├─ Root cause analysis
├─ Identification of attacker (if possible)
├─ Recommendations for prevention
└─ Report suitable for law enforcement / regulators
```

**Things to preserve for forensics:**
```
√ All database query logs (binary format, don't compress)
√ All application logs (ERROR/FATAL messages, access patterns)
√ All firewall logs (what was accessed from outside)
√ Disk snapshots (raw copy of affected systems)
√ Git commit history (check for unauthorized code changes)
√ Email/messaging history (Slack, email during breach time)
√ Monitoring alerts (when did systems first act weird)

Do NOT:
✗ Overwrite logs during investigation
✗ Run cleanup scripts (destroys evidence)
✗ Allow attacker to continue (assume they're still inside)
```

---

## 4. P0: Government Blocking/Threats Playbook

### Scenario: NTRA threatens platform shutdown OR blocks access

### Detection & Immediate Response (Hour 0-1)

**Who:** CEO + Legal + Government liaison (fixer)

**Verification:**
```
□ Is this a legitimate government request?
  ├─ Check if letter is on official government letterhead
  ├─ Verify sender email domain is real government domain
  ├─ Call phone number on letter (verify it's real)
  └─ If phishing: Ignore + report to cybersecurity team

□ If legitimate: What exactly are they asking?
  ├─ Remove specific content? (identify which posts/accounts)
  ├─ Shut down entire platform? (temporary vs permanent)
  ├─ Provide user data? (PII access request)
  ├─ Comply with content policy changes? (new filtering rules)
  └─ Save exact wording for legal team
```

**Initial Communication:**
```
Call government liaison/fixer immediately:
"We received [type of] request from [agency]. 
Key ask: [what they want]
Deadline: [when they want response]
We're reviewing with legal team. What's your read on this?
Can you make exploratory call to understand their concerns?"

Fixer's job: Find out if this is serious or negotiable
```

### Phase 1: Legal Review (Hour 1-4)

**Who:** Egyptian lawyer + International counsel

**Legal assessment:**
```
Questions for Egyptian lawyer:
1. Is this request legal under Egyptian law?
   ├─ Yes, we must comply (or face consequences)
   ├─ Maybe, it's grey area (we can negotiate)
   └─ No, we can refuse (risky but defensible)

2. What's the legal mechanism?
   ├─ Cybercrime Law article 25 (false news)? → Most common
   ├─ Telecom law? → Usually regarding spectrum/licensing
   ├─ Morality law? → Vague, dangerous
   └─ Understanding mechanism helps predict likelihood of enforcement

3. What happens if we don't comply?
   ├─ NTRA blocks ISPs from serving us? (effective ban)
   ├─ Fines? (amounts range wildly)
   ├─ Criminal charges against CEO? (depends on severity)
   └─ Mix of all three? (most likely)

4. Can we negotiate scope?
   ├─ "Instead of removing all political content, 
       we'll add disclaimer labels?"
   ├─ "We'll remove the specific post, not entire account?"
   ├─ "We need legal documentation to comply properly - 
       can you provide written guidance?"
   └─ Negotiation buys time + may soften request
```

**International counsel input:**
```
Questions for international lawyer:
1. Can we operate from outside Egypt if blocked?
   ├─ VPN/proxy to circumvent block? (risky, shows defiance)
   ├─ Move servers to other countries? (doesn't help Egypt users)
   ├─ Partner with international company? (can help, but slow)
   └─ Likely answer: Limited options if blocked

2. What's our legal exposure?
   ├─ Personal liability for CEO? (depends on laws)
   ├─ Corporate liability? (liability limited if LLC structured right)
   ├─ Tax/fund liability? (freezing of accounts, assets)
   └─ Insurance coverage? (hopefully yes, but may have exclusions)

3. Should we fight this publicly?
   ├─ Pro: "D-A-I-R-A stands for free speech" (good PR)
   ├─ Con: Antagonizes government, speeds blocking, no legal upside
   └─ Recommendation: Fight privately, communicate neutrally
```

### Phase 2: Response Options (Hour 4-24)

**Who:** CEO + Government liaison + Legal team

**Option A: Full Compliance (Safest)**
```
Action: Do exactly what government asks
├─ Remove content immediately
├─ Provide user data (if requested)
├─ Implement content filters they specify
└─ Promise ongoing cooperation

Pros:
✅ Avoid blocking
✅ Avoid fines
✅ Avoid criminal charges
✅ Appear cooperative (helps with future requests)

Cons:
❌ Sets precedent for more requests
❌ May need to remove legitimate content
❌ Damages free speech reputation
❌ Eventually they ask for everything (slippery slope)

Timeline to comply: 24-48 hours (what they usually demand)
```

**Option B: Partial Compliance + Negotiation (Medium)**
```
Action: Comply with parts you can defend, negotiate others

Example letter to government:

"Thank you for your request regarding [content].

D-A-I-R-A is committed to complying with Egyptian law. 
We've reviewed your request carefully and want to ensure we respond 
appropriately.

Regarding [specific content]:
We can [action 1] while we need clarification on [request 2].

To ensure we're in full compliance, we'd appreciate:
1. Written clarification on which specific content violates which law
2. Definition of "false information" vs. "opinion" for this context
3. Timeline and process for appeals if we believe request is overly broad

We take regulatory compliance seriously and want to work closely 
with NTRA to ensure we're meeting all obligations while continuing 
to serve Egyptian users."

Pros:
✅ Buy time (government has to explain)
✅ Create paper trail (documents for court, if it goes there)
✅ Negotiate scope (maybe they'll accept some filtering)
✅ Appear cooperative but not spineless

Cons:
❌ May anger government
❌ Could speed up blocking
❌ Requires strong legal defense to back up "no" on parts you refuse

Timeline: Government usually responds in 5-10 days
```

**Option C: Refuse (Nuclear - Only if illegal request)**
```
Example response:

"Thank you for your request. After careful legal review with our 
Egyptian and international counsel, we believe this request exceeds 
the scope of Egyptian law and would require us to violate principles 
of due process and user rights.

We are committed to complying with legal, specific takedown requests 
that identify particular content violating specific laws. We believe 
this request is overly broad and lacks the specificity required.

We respectfully decline this request but remain open to dialogue 
about how we can work with NTRA constructively."

Pros:
✅ Stand for principles
✅ Set legal precedent (if case goes to court)
✅ International support (press, human rights groups)
✅ Win reputation as platform defending free speech

Cons:
🔴 Platform likely gets blocked within days
🔴 Possible fines ($50K-500K)
🔴 Criminal charges possible
🔴 CEO may be detained for questioning
🔴 Business dies unless you can operate unblocked

Timeline to blocking: 2-7 days

ONLY use this option if:
- Request is clearly illegal (not grey area)
- You have investor/funding support
- You're willing to sacrifice Egypt market to make statement
- You have international PR support ready
```

**My Recommendation:**
```
Most likely scenario: Option B (partial compliance + negotiation)
├─ Appear cooperative (avoid knee-jerk blocking)
├─ Buy time to understand their real concerns
├─ Negotiate on defensible grounds
├─ Implement reasonable content policy changes
└─ Continue operating

Avoid Option C unless absolutely forced - it's existential risk
```

### Phase 3: Public Communication (Parallel)

**If government request becomes public:**

**What NOT to do:**
```
❌ Ignore it (shows you're not complying)
❌ Lie about it (coverup is worse than incident)
❌ Panic messaging (makes you look weak)
❌ Attack government (makes things worse)
```

**What to do:**

**Public Statement Template:**
```
"D-A-I-R-A received a content request from [agency] and is reviewing 
it carefully with our Egyptian legal team. 

We are committed to:
- Complying with Egyptian law
- Protecting user privacy
- Maintaining trust with our community
- Working constructively with regulators

We take regulatory requests seriously and will respond appropriately 
within the legal timeframe. We appreciate our users' patience as we 
work through this process."

Key principle: "cooperative + professional + no details"
```

**What to tell investors (Private):**
```
Email subject: "Transparency: Regulatory Request"

"We received a content request from [agency] asking us to [action]. 
We're reviewing this with our legal team in Egypt. 

Our assessment:
- This is a [legal/grey/borderline] request under Egyptian law
- Our response: [Option A/B/C above]
- Timeline: We expect resolution within [X days]
- Risk: [Low/Medium/High] - [reasoning]

We'll update you as the situation develops. This is fairly common 
for platforms operating in Egypt and we're handling it appropriately."
```

### Phase 4: Execution

**If you go with Option B (recommended):**
```
□ Send response letter to government within legal timeframe (usually 48-72h)
□ Implement content removal that's defensible
  ├─ Remove content that violates law (easy cases)
  ├─ Add labels to borderline content (not removal)
  └─ Keep content you can defend (refuse unjustifiable requests)

□ Monitor for government response
  ├─ If they're satisfied: You've bought time ✅
  ├─ If they escalate: Prepare for blocking scenario

□ If blocking happens: Activate Crisis Response (below)
```

---

## 5. Crisis Response: What To Do If Blocked

### Scenario: NTRA has blocked all ISPs from serving D-A-I-R-A

### Phase 1: Immediate Actions (Hour 0-4)

**Confirm the block:**
```
□ Test from multiple providers in Egypt:
  ├─ Vodafone
  ├─ Orange
  ├─ Etisalat
  ├─ All blocked → Confirmed NTRA action

□ Check ISP response codes:
  ├─ DNS failure? (ISPs blocking at DNS level)
  ├─ TCP RST? (ISPs blocking at network level)
  ├─ HTTP 403? (ISPs blocking at content filter)
  └─ Helps determine if we can circumvent with DNS/proxy solutions

□ Notify users:
  Post on homepage (for international users):
  "D-A-I-R-A service has been restricted in Egypt. Users in Egypt
  can access via VPN. We're working with regulators to restore access."
  
□ Update status page: "Platform Restricted in Egypt"

□ Email team:
  Subject: "Platform blocked in Egypt - Crisis mode activated"
```

### Phase 2: Circumvention Planning (Hour 4-24)

**Options to consider:**

**Option 1: Mirror Sites / Alternative Domains**
```
Setup alternative DNS:
├─ Buy new domain (daira-app.com, daira-tv.net, etc)
├─ Point to same backend
├─ Post instructions: "If blocked, try [alternative domain]"
└─ Limitation: NTRA can block these too within days

Pro: Gets users back quickly
Con: Cat-and-mouse game (NTRA keeps blocking, we keep redirecting)
Viability: Works for 1-2 weeks maximum
```

**Option 2: VPN / Proxy Recommendations**
```
Post on public channels:
"Access D-A-I-R-A via VPN:
- ExpressVPN (works in Egypt)
- NordVPN
- Surfshark"

Pro: Users can still access
Con: Terrible user experience, many users won't bother
Viability: Loses 70-80% of users
```

**Option 3: Mobile App Only**
```
Distribute iOS/Android apps via:
├─ Direct links (APK for Android)
├─ Private TestFlight (iOS)
└─ Avoid app stores (can be blocked too)

Pro: Mobile apps may not get filtered
Con: Many users have Android, older phones
Viability: Partial access for tech-savvy users
```

**Option 4: Exit Egypt + Focus on Other Markets**
```
Pause Egypt operations:
├─ Transfer user data to safe location
├─ Apologize to Egypt users
├─ Redirect to MENA operations (Saudi, UAE)
├─ Wait for political situation to change (months/years)
└─ Re-enter if blocked is lifted

Pro: Protects company, redirects to profitable markets
Con: Gives up Egypt market (your original target)
Viability: Fallback option if blocking is indefinite
```

### Phase 3: Stakeholder Communication

**Tell investors immediately:**
```
Subject: CRITICAL - Platform Blocked in Egypt

"At [time] today, D-A-I-R-A was blocked by NTRA (Egyptian telecom regulator)
at the ISP level.

This blocks all Egyptian users from accessing the platform. 
International users are unaffected.

Timeline:
- We received government request [X days ago]
- We responded [with Option B negotiation]
- Government escalated to ISP-level blocking instead of continued negotiation

Next steps:
1. We're attempting negotiation with NTRA via our government liaison
2. We're evaluating operation in other MENA countries
3. We'll determine within 48 hours if this is temporary or permanent

Financial impact:
- 70% of our user base is in Egypt
- Revenue loss: ~$2K/day
- Cash runway: [X days] before we need capital

Risk assessment: This blocks the Egypt market. We're evaluating pivoting to 
Saudi Arabia / UAE or returning to Egypt once situation changes."
```

**Tell employees:**
```
All-hands meeting:
"As many of you know, D-A-I-R-A has been blocked in Egypt today. 
This is a significant setback. Here's what we know:

What happened:
[Explain government interaction]

Why it happened:
[Explain which content/policies government objected to]

What it means:
- Egypt market is paused (unknown duration)
- Revenue in Egypt drops to ~$0
- We're re-evaluating strategy

Options we're considering:
A. Negotiate with government to unblock
B. Operate in other MENA markets (Saudi, UAE)
C. Shut down and preserve capital

My commitment:
- I will keep you updated daily
- We're not abandoning the team
- Everyone's jobs are secure [for now] while we figure this out
- We're exploring all options

Questions? Let's discuss."

Morale: This is devastating. Be honest, don't pretend to have answers you don't.
```

---

## 6. Crisis Communication Templates

### Press Release: Security Breach

```
FOR IMMEDIATE RELEASE

D-A-I-R-A Addresses Security Incident; Implementing Enhanced Protections

Cairo, Egypt – D-A-I-R-A, a social video platform for creators, 
today announced it discovered and addressed a security incident 
that may have affected user data.

Details:
- Date: [Date]
- Data affected: [specific: emails, phone numbers - do NOT exaggerate]
- Users impacted: [X users]
- Unauthorized access: [period of access, if known]

Response:
- Immediate: Secured systems, rotated credentials, invalidated user sessions
- 24-48 hours: Notified affected users and authorities (PDPA)
- Ongoing: Implemented enhanced security measures

Actions for users:
- All users must reset passwords (required on next login)
- Change passwords on other sites if you reused this password
- Consider credit monitoring (1 year free provided)
- Monitor email/phone for suspicious activity

D-A-I-R-A is committed to protecting user data and regrets this incident.

For more information, contact: security@daira.app
```

### Press Release: Service Outage

```
FOR IMMEDIATE RELEASE

D-A-I-R-A Service Restored After Planned Maintenance

Cairo, Egypt – D-A-I-R-A restored full platform functionality at 
[time] on [date] after a [duration] service disruption.

What happened:
The platform was temporarily unavailable due to [brief explanation].

Root cause:
[Technical explanation in plain language]

Why it took so long:
[Brief explanation of complexity / why we couldn't fix faster]

What we're doing:
1. [Action 1 to prevent recurrence]
2. [Action 2]
3. [Action 3]

We apologize for the disruption and appreciate user patience.

For updates, visit: status.daira.app
```

### Email: Service Disruption Apology

```
Subject: Our Apologies For Yesterday's Service Disruption

Hi [User],

Yesterday, D-A-I-R-A experienced a service disruption lasting [duration], 
and we're deeply sorry.

What we learned:
[Technical issue + why we missed it + how we'll prevent it]

How we're fixing it:
[List 2-3 concrete actions]

Thank you for sticking with us through this. We know how important 
it is for you to have a reliable platform, and we're committed to 
doing better.

If you experienced any issues, please email support: support@daira.app

Best regards,
The D-A-I-R-A Team
```

---

## 7. Crisis Management Roles & Responsibilities

### War Room Team (Activated for P0 incidents)

```
Role: CEO
├─ Decision maker
├─ External communications (investors, press)
├─ Final authority on major decisions
└─ Works 18-20 hours during major incident

Role: CTO / Head of Engineering
├─ Technical lead
├─ Direct incident response (or delegates to on-call)
├─ Provides technical updates to CEO
└─ Calls all-hands if major incident

Role: Head of Legal
├─ Compliance obligations (PDPL, government requests)
├─ Statement review (before release)
├─ External counsel coordination
└─ Contracts/insurance claims

Role: Head of Communications / PR
├─ Status page updates (every 30 min during major incident)
├─ User communications (emails, social media)
├─ Press release drafting
└─ Media response

Role: Head of Support
├─ Tracking support tickets
├─ Responding to user concerns
├─ Escalating urgent issues
└─ User sentiment monitoring

Role: On-Call Engineer (During incident)
├─ Investigates root cause
├─ Implements fix
├─ Technical liaison to CTO
└─ Works until resolved
```

### Escalation Chain

```
Trigger: P0 detected (automated alert)
↓
Page on-call engineer (SMS + call)
↓
On-call diagnoses for 15 minutes
↓
If not fixed in 15 min: Page CTO
↓
If not fixed in 30 min: Page CEO + convene war room
↓
If not fixed in 1 hour: Contact external incident response firm
↓
If not fixed in 2 hours: Notify investors (all Series A+)
↓
If not fixed in 4 hours: Public statement required
```

---

## 8. Monthly Incident Drills

**Every month, run one scenario:**

```
Month 1: Database failure
├─ Kill database, see how fast we recover
├─ Test backup restore procedure
└─ Measure: How many minutes to restore?

Month 2: Security breach
├─ Simulate attacker access to prod
├─ Run through notification procedures
└─ Measure: How many hours to notify users?

Month 3: Government request
├─ Simulate NTRA takedown demand
├─ Practice negotiation response
└─ Measure: Response time, decision quality

Month 4: Major feature broken
├─ Break payments (simulate)
├─ Practice troubleshooting
└─ Measure: Detection lag + fix time

Month 5-12: Repeat
```

**Scoring:**
```
Grade A: Detected <30min, resolved <2 hours
Grade B: Detected 30min-1 hour, resolved 2-4 hours
Grade C: Detected 1-2 hours, resolved >4 hours
Grade F: Not detected / poor response

Target: All incidents Grade B or better
Escalation: Grade C+ triggers post-mortem
```

---

**Owner:** CTO + CEO  
**Review Frequency:** Quarterly  
**Last Updated:** [Today]  
**Next Drill:** [Date of next incident simulation]  

**Remember:** You'll have a crisis. The question is whether you're ready.
