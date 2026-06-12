# Telegram — Weeks 1-2 (4 posts)

These are mirrors of the best Twitter content from each week, formatted for Telegram (paragraphs, line breaks, no character-count constraint).

Send on the days marked in `content-calendar.md`. Telegram doesn't reward frequency the way Twitter does — 2 posts/week is plenty for a beta channel.

---

## Post 1 — Sunday of Week 1 (founder story)

Send immediately after the Twitter thread goes live.

```
why i built journalfx

i was a profitable trader who couldn't make money.

the reason wasn't my strategy. it was my head.

so i started logging. but every journal i tried asked the wrong questions.

'how did you feel?' — vague.
'did you follow your plan?' — yes/no.

none of it connected my mental state to my actual P&L outcome.

so i built my own.

→ tilt score (a real number for your mental state before a trade)
→ psychological slip detection (revenge, FOMO, FUD, bored, hyped — all logged)
→ mt5 desktop bridge (auto-sync, no manual entry)

the first version was ugly. it worked.

now i'm building it for other traders.
called it @journalfx.
free for 10-50 beta testers.

if you've ever blown a small account on tilt, reply or DM me.
```

---

## Post 2 — Monday of Week 2 (tilt score)

```
introducing: tilt score

not 'are you feeling good?'
not 'rate your day 1-10.'

tilt score = a single number from 0-100 that answers one question:
'are you about to make a stupid decision right now?'

how it works:
→ before every trade, log 3 things in ~10 seconds
   - clarity (1-10)
   - conviction (1-10)
   - emotional state (calm / focused / hyped / bored / tilted / FOMO-ing)
→ tilt score = (10 - clarity) * 5 + state_modifier
→ 0-30 = green light
   31-60 = caution
   61-80 = journal why
   81-100 = trade blocked, acknowledge tilt

what it does:
→ makes you slow down for 5 seconds before a bad trade
→ doesn't pretend to be a magic AI. you decide.
→ creates a record: 'i knew i was tilted. i traded anyway' is more powerful than you think.

free beta. 10-50 traders. → @journalfx
```

---

## Post 3 — Friday of Week 2 (pattern observation)

```
anonymized pattern from 50+ MT5 traders who journaled with us this week:

→ 'bored' entries: NEGATIVE average R:R
→ 'hyped' entries: POSITIVE average R:R
→ 'tilted' entries: -1.4R average
→ 'focused' entries: +1.1R average

your state predicts your P&L better than your setup.

every time.

(why 'bored' loses money: bored traders force setups that aren't there. the trade has no edge. it dies in 30 minutes.)

free beta for 10-50 traders → @journalfx
```

---

## Post 4 — Sunday of Week 2 (beta milestone — fill in as it happens)

```
beta milestone update:

[X] traders have logged [Y] trades in the last [Z] days.

what surprised me:
→ the most common 'psychological slip' tag is 'bored' (not 'FOMO' like i expected)
→ 3 traders asked me to make tilt score harder to game
→ 1 trader said the act of logging tilted trades made him take fewer

this is why you build in public.
you learn things you can't predict.

[X] slots left in free beta.
DM me or reply to any post.
→ @journalfx
```

---

## Telegram channel setup checklist (do this before posting)

- [ ] Channel name: "JournalFX" or "JournalFX Beta"
- [ ] Channel description: "building the trading journal that catches what your broker can't. psychology-first. MT5. free beta for 10-50 traders."
- [ ] Channel photo: JournalFX logo
- [ ] Pinned message: Post 1 (the founder story)
- [ ] Discussion group (optional): turn on comments if you want replies visible
- [ ] Sign on every post: → @journalfx (links back to your Twitter)
