# Twitter — Week 2 (8 posts)

Voice: same as week 1. Casual founder. Lowercase. First person. Short sentences. No hashtags. Reply to every comment within 24 hours.

By week 2, you should have:
- 30+ accounts on your engagement list
- 1-2 DMs from interested traders
- A sense of which week-1 posts got traction

Post cadence: 5-6 posts/week + 5-10 replies/day on trading days.

---

## Post 1 — Monday (tilt score thread)

A 5-tweet thread. Post as a single thread.

**Tweet 1 (hook):**

```
introducing: tilt score.

not 'are you feeling good?'
not 'rate your day 1-10.'

tilt score = a single number from 0-100 that answers one question:
'are you about to make a stupid decision right now?'

here's how i built it. 🧵
```

**Tweet 2:**

```
step 1: the input.
before every trade, you log 3 things in ~10 seconds:
- clarity (1-10)
- conviction (1-10)
- emotional state (calm / focused / hyped / bored / tilted / FOMO-ing)

3 numbers + 1 word. that's the input.
```

**Tweet 3:**

```
step 2: the formula.
tilt score = (10 - clarity) * 5 + state_modifier

state_modifier:
- calm = -10
- focused = -5
- hyped = +5
- bored = +10
- tilted = +20
- FOMO = +25

final score: 0-100.
```

**Tweet 4:**

```
step 3: the action.
0-30 = green light
31-60 = proceed with caution (warning shown)
61-80 = journal why before submitting
81-100 = trade blocked, must acknowledge tilt

i added the 'acknowledge' step on day 12. it cut my revenge trades by half.
```

**Tweet 5 (CTA):**

```
what it does:
→ makes you slow down for 5 seconds before a bad trade
→ doesn't pretend to be a magic AI. you decide.
→ creates a record: 'i knew i was tilted. i traded anyway' is more powerful than you think.

building this in @journalfx. free beta for 10-50 traders.
```

---

## Post 2 — Tuesday (MT5 setup how-to)

```
how to actually set up an MT5 trade log in 2026 (the right way):

1. install a journal that doesn't make you type 47 things per trade
2. log your MENTAL state, not just the trade
3. set up automatic sync via desktop bridge (5 min, no code)
4. review weekly: which mindset tag had the worst R:R?
5. repeat

→ that's literally what @journalfx does. free beta now.
```

---

## Post 3 — Wednesday (contrarian take)

```
unpopular opinion: most trading journals fail because they ask too much.

'rate your confidence, your risk:reward, your adherence to plan, your entry quality, your exit quality...'

by trade 5 you're tired. by trade 15 you're lying.

the journal that wins asks 2-3 things and STICKS.

→ that's why @journalfx is built around tilt score + 1 mindset tag. nothing else.
```

---

## Post 4 — Thursday (behind-the-scenes bug fix)

```
day 12 of building @journalfx.

spent 4 hours today on a bug where the MT5 desktop bridge was double-counting partial closes.

turned out: the broker's trade ID wasn't unique per partial fill. had to add a (timestamp + volume) composite key.

small bug. would have corrupted every trade log if it shipped.

this is why you beta test. looking for 10-50 traders to find these things. free → DM me.
```

---

## Post 5 — Friday (pattern from journals)

```
anonymized pattern from 50+ MT5 traders who journaled with us this week:

→ 'bored' entries: NEGATIVE average R:R
→ 'hyped' entries: POSITIVE average R:R
→ 'tilted' entries: -1.4R average
→ 'focused' entries: +1.1R average

your state predicts your P&L better than your setup. every time.

→ @journalfx. free beta. 10-50 traders.
```

---

## Post 6 — Saturday morning (founder story 2.0)

```
second trade that taught me to journal:

i closed a +3R winner early because i was scared.
it went on to hit +8R without me.

the loss was $500. (missed profit.)
the lesson: my journal asked 'did you follow your plan?' — yes.
but it never asked: 'were you afraid when you closed it?'

fear has a R:R cost too. journaling that matters.

→ building @journalfx
```

---

## Post 7 — Saturday afternoon (standalone hot take)

```
'most traders don't have a strategy problem. they have a logging problem.'

you can have the best strategy in the world and lose money to revenge trades your broker never logged.

that's the gap @journalfx is built to close. free beta. 10-50 traders.
```

---

## Post 8 — Sunday (beta milestone — choose the right one)

**If you have beta testers logged in, post this (fill in the brackets):**

```
beta milestone: [X] traders have logged [Y] trades this week.

what surprised me:
- the most common 'psychological slip' tag is 'bored' (not 'FOMO' like i expected)
- 3 traders asked me to make tilt score harder to game
- 1 trader said the act of logging tilted trades made him take fewer

this is why you build in public. you learn things you can't predict.

→ @journalfx. free beta. [X] slots left.
```

**If no testers yet, post this instead:**

```
the weirdest part of building a trading journal:

i don't trade as much anymore.
because the act of asking 'why am i taking this trade?' makes you take fewer trades.

that's not a feature. that's the product.

→ @journalfx. free beta. 10-50 traders.
```

---

## Replies to expect (and how to handle them)

- **"is the desktop bridge safe?"** → "yes. it runs locally on your machine. no data leaves your computer. only your anonymized trade stats sync to the cloud journal."
- **"what's tilt score?"** → "0-100 number for your mental state before a trade. 0-30 = green light, 81-100 = blocked. full breakdown in the pinned tweet / post 1 above."
- **"is this available now?"** → "yes, in beta. DM me with your MT5 broker + how long you've been trading, and i'll get you in."
- **"can i use it with mt4?"** → "mt4 support is on the roadmap. beta is mt5 only for now."
- **"do you have an iOS app?"** → "web app only for beta. mobile is post-beta."
- **"this is great, what stack did you build it on?"** → share your actual stack. the build-in-public angle is part of the brand.

---

## End-of-week-2 review (do this Sunday evening)

Spend 15 minutes and answer these 3 questions. Write them down. We'll use them to draft weeks 3-4.

1. **Top 3 posts of the last 2 weeks** — by likes, replies, or quote-tweets. What did they have in common? (Hook type? Length? Topic?)
2. **Bottom 3 posts** — what didn't work? Was it the topic, the time, or the format?
3. **Total engagement** — replies, DMs, link clicks. Are traders finding you? Are they asking about the beta?
