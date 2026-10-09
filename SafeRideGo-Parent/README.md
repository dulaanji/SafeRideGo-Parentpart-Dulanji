# SafeRideGo – Transport App: Parent part (IT3060 HCI, Milestone 03)

SafeRideGo is a school-van transport tracking app. This repository is the **Parent part** of the Transport app, built from the Figma Make "Parent Dashboard" design.

| Layer | Technology |
|---|---|
| Mobile + web front end | React Native (Expo SDK 57) + React Navigation, runs in **Chrome**, Expo Go, or as an APK |
| Back end / API | Node.js + Express (REST, JSON) |
| Database | MongoDB Atlas (Mongoose) |
| Auth | Mobile number + password (bcrypt), JWT, demo OTP `482615` |

```
SafeRideGo-Parent/
  backend/      Express API + MongoDB models
  parent-app/   Expo app for the Parent part (App.js + src/)
  docs/         step-by-step guides + report kit
```

## Do these in order
1. `docs/1_MONGODB_ATLAS.md`  – create DB user, get connection string, fill `backend/.env`
2. `docs/3_RUN_IN_CHROME.md`  – start backend, start app, test every CRUD
3. `docs/2_GITHUB_PUSH.md`    – push to GitHub (GitHub Desktop or VS Code)
4. `docs/4_REPORT_KIT.md`     – tech-stack text, traceability matrix, test cases, usability plan, deviations, Gantt, viva Q&A

## Quick start (after MongoDB is ready)
```
# terminal 1
cd backend
npm install
copy .env.example .env      (then edit .env)
npm run dev

# terminal 2
cd parent-app
npm install
npx expo start --web        (Chrome opens at http://localhost:8081)
```
Demo verification code: **482615**

## CRUD per interface
| Screen | Create | Read | Update | Delete |
|---|---|---|---|---|
| Login | sign-in record `POST /auth/login` | credentials check | – | – |
| Create account | `POST /auth/register` | duplicate-number check | – | – |
| Verify | sign-in record | – | `POST /auth/verify` (verified=true) | – |
| Home (Trips) | – | `GET /journey/current`, `/profile`, `/children`, `/alerts` | `POST /journey/advance`, `/journey/reset` | – |
| Live map | – | `GET /journey/current` | `PUT /profile` (alert-me-within N min) | – |
| Journey details | `POST /notes` | `GET /notes`, `/journey/current` | `PUT /notes/:id` | `DELETE /notes/:id` |
| Trip history | `POST /trips/:id/feedback` | `GET /trips` | `PUT /feedback/:id` | `DELETE /feedback/:id` |
| Alerts | `POST /alerts/simulate-delay` (from Profile) | `GET /alerts` | `PUT /alerts/:id`, `/alerts/read-all` | `DELETE /alerts/:id` |
| Profile | `POST /children` | `GET /profile`, `/children`, `/sessions` | `PUT /profile`, `PUT /children/:id` | `DELETE /children/:id`, `DELETE /profile` |
