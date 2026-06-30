# AI and Software Engineering: How Engineering Decisions Enabled the Deepfake Social Engineering Crisis

Mike Olson (with help from Claude)

MSSE642 Software Assurance

---

## 1. Introduction

In February 2024, a finance employee at Arup, a global engineering firm, joined what looked like a routine video call with the company's CFO and several other executives. He authorized 15 separate transactions totaling **$25.6 million**.

Every single person on that call was fake. Not impersonated by an actor — *generated* by AI, in real time, having a live conversation.

This isn't just a security story — it's a software engineering story. Every capability the attackers used (real-time voice synthesis, live video generation, API-driven bot orchestration) is a *system someone designed, built, and shipped*. The question for us as engineers isn't just "how do we stop this," it's "what design decisions made this possible, and what does that mean for how we build software going forward."

---

## 2. What Changed — A Systems View

Social engineering has always relied on exploiting trust — urgency, authority, familiarity. What's new is that AI software systems removed the *engineering cost* of faking the things we used to trust as proof:

- **Voice cloning pipelines** turned a research problem (text-to-speech) into a low-latency API. Real-time vishing requires inference fast enough to sustain a live phone conversation — that's a systems/latency engineering achievement, not just a model improvement.
- **Live video synthesis** at Arup required multiple synchronized AI-generated "actors" rendered in real time on a video call — essentially a distributed system maintaining multiple consistent fake identities simultaneously under load.
- **Bot orchestration platforms** (like Meliorator, below) are software products: account management, content generation, and engagement automation, built with the same DevOps rigor as any SaaS platform — just aimed at deception instead of legitimate users.

These three vectors — voice, video, and crowds — map onto classic STRIDE threat categories: **Spoofing** (voice/video identity), and **Repudiation** (deniable, hard-to-attribute fake interactions). Each is the product of an engineering pipeline, which means each has an engineering surface for defense too.

---

## 3. Case Study One: Voice Cloning / Vishing

**The UK Energy Firm, 2019** — the first major documented case. Criminals cloned the voice of a German parent company's CEO and convinced a UK executive to wire **€220,000 / $243,000** to a Hungarian supplier. The money was gone in hours, routed through Mexico.

**Wiz, 2024** — attackers cloned CEO Assaf Rappaport's voice using audio from a public conference talk, then voicemailed it to dozens of employees asking for credentials. It failed — because employees noticed the voice sounded slightly off from his normal day-to-day tone. A reminder that detection often comes down to human familiarity, not technology.

**The SE angle:** this attack surface didn't exist until voice synthesis software crossed a usability threshold. Open-source projects like Tortoise-TTS and VALL-E lowered the engineering barrier to entry so far that commercial "deepfake-as-a-service" platforms now exist for a few hundred dollars. The same engineering principles that make voice APIs usable for accessibility tools and customer service bots also make them usable for fraud — this is a textbook case of **dual-use software design**, which is now a first-class concern in how we architect and gate access to powerful AI capabilities, not an edge case to handle later.

---

## 4. Case Study Two: Deepfake Video

**Arup, Hong Kong, February 2024** — the case from the opening. $25.6 million lost in a *multi-person* live deepfake video conference. This shattered the old assumption that deepfakes only worked one-on-one or in pre-recorded clips.

**WPP, 2024** — scammers built a fake WhatsApp account with CEO Mark Read's public photo, set up a Teams meeting, and used voice-cloned audio plus edited YouTube footage to impersonate him to staff. It failed — an alert employee recognized the request didn't fit Read's normal behavior and flagged it.

**Why this breaks old defenses:** the standard advice for years was "if an email seems off, call to verify" or "get on a video call to confirm." From an SE perspective, this is a classic case of **trusting a channel without authenticating the endpoint** — the same architectural flaw behind decades of phishing. A callback doesn't help if the voice on the other end is cloned. A video call doesn't help if the video is fabricated. The verification *mechanism itself* needs re-architecting — this is where cryptographic identity verification (signed messages, hardware-backed authentication, out-of-band channels not controlled by the requester) becomes a software design requirement, not just a policy one.

---

## 5. Case Study Three: Bots and Manufactured Consensus

This is the vector that doesn't target an individual — it targets a *population*.

**The Meliorator Bot Farm, 2024** — the DOJ, Canada, and the Netherlands jointly dismantled a Russian operation using AI software called Meliorator to mass-produce thousands of fake but believable American social media personas — complete with backstories, posting histories, and follower networks the operators internally called "souls." These accounts engaged in real political conversations and amplified narratives at scale.

This is social engineering aimed at trust in *information itself*. As of 2024, bot traffic made up the majority of web traffic for the first time — meaning the digital "crowd" we read as social proof can no longer be assumed to be human at all.

**The SE angle:** bot detection is itself a software engineering arms race. Platforms build classifiers (often graph neural networks analyzing account behavior patterns) to flag automated accounts; bot operators respond by engineering around the detection signals — randomizing post timing, generating unique profile content, mimicking human browsing patterns. This is the same adversarial design loop as malware/antivirus or fraud detection in fintech: every defensive system shapes the next generation of attacking systems, which is why detection-only strategies eventually plateau and platform-level architectural choices (rate limits, identity verification at signup, API access controls) matter more than reactive content moderation.

---

## 6. Why This Works: The Psychology Hasn't Changed

Every case above exploits the same four levers humans have always been vulnerable to:

- **Urgency**     — act now, don't verify
- **Authority**   — it's the CEO, the CFO, don't question it
- **Familiarity** — that's *his* voice, *her* face
- **Consensus**   — everyone else seems to agree, so it must be true

AI didn't invent new psychological weaknesses. It just made the *evidence* used to trigger them nearly free to produce.

---

## 8. Conclusion

For decades, "seeing is believing" and "I know that voice" were our last line of defense against deception. AI didn't just break those defenses — it exposed that we'd been relying on unauthenticated trust signals as if they were security controls all along. As software engineers, closing that gap is our job, not just security's.

---

### Sources / Further Reading
- Arup deepfake case — multiple outlets, Feb 2024 (Hong Kong)
- UK energy firm voice cloning fraud — Avast, 2019/2024 reporting
- WPP, Wiz, LastPass deepfake attempts — Eftsure, "7 Deepfake CEO Scams"
- DOJ Meliorator bot farm takedown, 2024
- Thales 2024 bot traffic report
