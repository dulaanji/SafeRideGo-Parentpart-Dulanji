# 4. Report kit – Milestones 01 + 02 + 03 (Transport app – Parent part)

Brief rules that drive this file: Milestone 03 report max **35 pages**, file name `IT3060HCI2026_Milestone03_Group<number>`, AI-written share **under 50%**, plagiarism = zero. 
**Everything below is a starting point. Rewrite it in your own words and fill the blanks with your real results.** Evidence rows marked `[fill]` need your Milestone 01/02 data (57-respondent survey, interface IDs P-01…, requirement IDs).

## 1. Report outline (Milestone 03 template)
| Section | Source |
|---|---|
| Executive summary | write last, ½ page |
| Milestone 01 summary – problem, stakeholders, research, requirements | your Assignment 1 report (shorten to ~3 pages) |
| Milestone 02 summary – sketches, wireframes, low/hi-fi | your Assignment 2 report (~3 pages, Figma Make link) |
| Tech stack + justification | §2 below |
| Architecture overview | §3 |
| Implementation + screenshots | run the app, screenshot each screen (§4 gives order) |
| Traceability matrix | §5 |
| Functional test cases + results | §6 |
| Usability testing plan, execution, results | §7 |
| Issues + fixes | §7 issue log |
| Deviations from the hi-fi prototype | §8 |
| Gantt chart | §9 |
| Conclusion + lessons learned | your own reflection |

## 2. Tech stack justification (draft – rephrase)
| Part | Choice | Why (against project needs) | Alternative rejected |
|---|---|---|---|
| Front end | React Native + Expo | one JS code base for Android, iOS and Chrome; Expo Go lets users test without installing an APK; team already knows JavaScript/React from the Figma Make prototype | Flutter (new language), native Kotlin (Android only) |
| Navigation | React Navigation (tabs + stack) | matches the prototype: 4 bottom tabs + detail screens | Expo Router (extra file-routing learning) |
| Back end | Node.js + Express REST | lightweight, same language as front end, simple CRUD endpoints | Firebase (less control, harder to explain in viva) |
| Database | MongoDB Atlas (Mongoose) | free 512 MB tier, JSON documents fit journeys/alerts/notes, no server to install | MySQL (needs hosting + schema migration) |
| Auth | mobile number + password, bcrypt hash, JWT (7 days) | parents identify by phone in the survey; stateless tokens suit mobile | SMS OTP provider (cost); demo OTP used instead |
| Map | SVG route schematic | no API key/billing; enough to show van progress for the assessment | Google Maps SDK (key + billing) – future work |

## 3. Architecture
```
Transport app – Parent part (Expo / React Native)          Express REST API                MongoDB Atlas
 screens ──> src/api.js (fetch + JWT) ──>  routes/auth.js, routes/parent.js ──> Mongoose models
 AsyncStorage keeps the token              middleware.js verifies JWT          parents, children, journeys,
                                           every query filtered by parent id   trips, feedbacks, alerts,
                                                                               pickupnotes, sessions
```
Security points to mention: passwords hashed (bcrypt), every route except register/login/verify requires a token, each parent can only read/write documents with their own `parent` id.

## 4. Screenshot order (implementation section)
Login → Create account → Verify → Home → Live map → Journey details (with note) → Trip history (with feedback) → Alerts (all + unread) → Profile (+ child modal). Take the matching Figma frame beside each one for the fidelity comparison.

## 5. Traceability matrix (requirements → prototype → implementation → tests)
Fill the **M1 requirement** column from your Assignment 1 table and the **Prototype frame** column with your P-IDs.

| Screen | M1 requirement `[fill]` | Prototype frame `[fill]` | Implementation file | API | Tests |
|---|---|---|---|---|---|
| Login | secure access for verified parents | | `Login.js` | `POST /auth/login` | TC-01, TC-02 |
| Create account | | | `Register.js` | `POST /auth/register` | TC-03, TC-04 |
| Verify | | | `Verify.js` | `POST /auth/verify` | TC-05, TC-06 |
| Home | live journey status / ETA | | `Home.js` | `GET /journey/current` | TC-07, TC-08 |
| Live map | live van location, call driver | | `LiveMap.js` | `GET /journey/current`, `PUT /profile` | TC-09, TC-10 |
| Journey details | milestones timeline, tell driver | | `JourneyDetails.js` | `/notes` CRUD | TC-11 – TC-14 |
| Trip history | arrival confirmation, feedback | | `History.js` | `/trips`, `/feedback` | TC-15 – TC-18 |
| Alerts | timely notifications | | `Alerts.js` | `/alerts` | TC-19 – TC-22 |
| Profile | manage account, child, alert channels | | `Profile.js` | `/profile`, `/children` | TC-23 – TC-29 |

## 6. Functional test cases (execute and fill *Actual / Result*)
| ID | Screen | Steps | Expected | Actual | Pass/Fail |
|---|---|---|---|---|---|
| TC-01 | Login | valid number + password | Home opens | | |
| TC-02 | Login | wrong password | error "Wrong mobile number or password" | | |
| TC-03 | Register | all fields valid | goes to Verify, parent saved in Atlas | | |
| TC-04 | Register | same number again | error "already registered" | | |
| TC-05 | Verify | code 482615 | Home opens | | |
| TC-06 | Verify | wrong code | error "Wrong verification code" | | |
| TC-07 | Home | open Home | child name, ETA, progress shown | | |
| TC-08 | Home | tap Next stage ×3 | progress + ETA change, alerts created | | |
| TC-09 | Live map | open map | van marker at current stage, ETA shown | | |
| TC-10 | Live map | choose 10 min | selected chip stays after reopening | | |
| TC-11 | Journey details | add note | note appears in list | | |
| TC-12 | Journey details | edit note | text updated | | |
| TC-13 | Journey details | delete note | note removed | | |
| TC-14 | Journey details | add empty note | error "Note cannot be empty" | | |
| TC-15 | History | 4 stars + comment, submit | feedback saved | | |
| TC-16 | History | change to 5 stars, update | rating updated | | |
| TC-17 | History | delete feedback | stars reset | | |
| TC-18 | History | submit with 0 stars | message "pick a star rating" | | |
| TC-19 | Alerts | open Alerts | list newest first | | |
| TC-20 | Alerts | tap unread alert | marked read | | |
| TC-21 | Alerts | Mark all read, Unread tab | Unread tab empty | | |
| TC-22 | Alerts | trash icon | alert removed | | |
| TC-23 | Profile | edit name, Save | name updated on Home | | |
| TC-24 | Profile | toggle WhatsApp | stays on after reload | | |
| TC-25 | Profile | Add child | child listed | | |
| TC-26 | Profile | edit child | grade updated | | |
| TC-27 | Profile | remove child | child removed | | |
| TC-28 | Profile | Simulate delay | delay alert + ETA +10 on Home | | |
| TC-29 | Profile | Delete account | signed out, data gone from Atlas | | |

## 7. Usability testing (minimum 5 participants, recorded, public drive link)
**Participants:** 5 or more real/proxy parents `[fill: age, device, comfort with apps]`; get consent (note in appendix).
**Tasks (one per major requirement):**
| # | Task | Success criterion | Target time |
|---|---|---|---|
| T1 | Create an account and verify | reaches Home without help | < 90 s |
| T2 | Find when the van reaches your stop | states the ETA correctly | < 20 s |
| T3 | Open the live map and call the driver | taps Call driver | < 30 s |
| T4 | Leave a pickup note for the driver | note saved | < 45 s |
| T5 | Check the child arrived safely and rate the trip | finds "Arrived safely", rates | < 45 s |
| T6 | Mark all alerts as read | Unread tab empty | < 20 s |
| T7 | Turn off SMS updates | toggle off | < 20 s |
**Metrics:** task success rate, time on task, errors per task, 1–5 ease rating per task, SUS score (10 questions) at the end.
**Issue log (log even if not fixed):**
| ID | Issue | Task | Severity (H/M/L) | Fix / planned |
|---|---|---|---|---|
| U-01 | `[fill from sessions]` | | | |

## 8. Deviations from the Figma Make prototype (justify each)
| Area | Prototype | Implementation | Justification |
|---|---|---|---|
| Platform | web React (Figma Make) | React Native (Expo) | brief needs a mobile app, not a clickable prototype |
| Live map | street map with tiles | SVG route schematic | no paid maps key; keeps focus on journey status |
| OTP | real SMS code | fixed demo code 482615 | SMS gateway costs money; shown on screen as in the prototype |
| Tab icons / fonts | Manrope + custom icons | Ionicons + system font | no custom font files bundled |
| Added | – | **Demo controls** on Home (Next stage / Restart) | no real van GPS, needed to demonstrate live updates |
| Added | – | feedback form on every trip, not only the latest | needed for full CRUD per trip |
| Added | – | add / edit / remove child, delete account, "alert me within N min" | needed for ≥2 CRUD operations per interface |

## 9. Gantt chart (task list to draw in Excel/Sheets; dates from the briefs)
| Phase | Tasks | Dates |
|---|---|---|
| M1 | problem, stakeholders, survey, analysis, personas, requirements | 24.07 – 09.08.2026 |
| M2 | sketches, wireframes, low-fi, hi-fi Figma, user testing | 24.07 – 09.08.2026 |
| M3 | stack choice, backend + DB, screens, CRUD, testing, usability test, report | 28.09 – 09.10.2026 |
Use the real dates your group worked; this is only the skeleton.

## 10. Viva – questions to be ready for
1. Why React Native + Expo instead of Flutter/native? (§2)
2. Show the file where "Next stage" updates the journey. → `routes/parent.js` `/journey/advance`, `Home.js` `act()`
3. How does login stay secure? → bcrypt hash, JWT in header, middleware `auth`
4. Why can't parent A see parent B's notes? → every query includes `parent: req.parentId`
5. Show one full CRUD (notes) from screen → API → MongoDB document.
6. What happens if the backend is down? → `api.js` shows "Cannot reach the server"
7. Which requirement does the Alerts screen satisfy? (§5)
8. What did usability testing find and what did you change? (§7 log)
9. What would you add with more time? → real GPS from the Driver app, push notifications, Google Maps, real SMS OTP
10. Which parts did you write yourself and which did the AI help with? Be honest and be able to explain every file.
