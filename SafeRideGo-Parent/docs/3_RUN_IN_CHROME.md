# 3. Run the Transport app – Parent part (Chrome first, then phone)

Install once: Node.js LTS, VS Code, Chrome.

## Terminal 1 – backend
```
cd backend
npm install
npm run dev
```
Wait for `MongoDB connected`. Leave it running.

## Terminal 2 – app in Chrome
```
cd parent-app
npm install
npx expo start --web
```
Chrome opens `http://localhost:8081`. The app shows inside a phone-width column.
(If it doesn't open: in the terminal press **w**.)

`src/config.js` already uses `http://localhost:5000/api` for Chrome. Nothing to edit.

## Test every CRUD (use this as your demo + viva script)
1. **Create account** – name, number `0771234567`, password `123456` → Create (CREATE parent).
2. **Verify** – code `482615` → lands on Home.
3. **Home** – tap **Next stage** (UPDATE journey) a few times; ETA, progress bar and the bell dot change. **Restart** resets.
4. **Live map** – van marker moves with the stage; pick **3 / 5 / 10 min** (UPDATE profile setting).
5. **Journey details** – add a note "Waiting at the gate" (CREATE), **Edit** it (UPDATE), **Delete** it (DELETE).
6. **Trip history** – pick stars + comment → Submit (CREATE feedback) → change stars → Update (UPDATE) → Delete (DELETE).
7. **Alerts** – tap an alert to mark read (UPDATE), **Mark all read**, trash icon (DELETE). Unread tab filters (READ).
8. **Profile** – change name → Save (UPDATE); toggle SMS/WhatsApp (UPDATE); **+ Add** child (CREATE), tap child → edit (UPDATE) / Remove (DELETE); **Simulate a 10-minute delay** (CREATE alert, check Alerts + Home ETA).
9. **Sign out**, then sign in again (READ). Profile shows "Last sign-in".
10. **Delete my account** removes all data (DELETE).
Check the same data in Atlas → Browse collections.

## On a phone (Expo Go)
1. Phone and PC on the same Wi-Fi.
2. Put your PC's IPv4 (`ipconfig`) in `PC_IP` inside `parent-app/src/config.js`.
3. `npx expo start`, scan the QR code with Expo Go. Windows Firewall: allow Node.js on private networks for port 5000.

## Installable APK (brief asks for a build "where applicable")
```
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
Needs a free Expo account. Before building, set `PC_IP` in `config.js` to a **deployed** backend URL (e.g. Render) – an APK cannot reach `localhost`. If you can't deploy in time, demo with Chrome/Expo Go and say so in the viva.

## Common errors
| Problem | Fix |
|---|---|
| "Cannot reach the server" | backend not running, or wrong `PC_IP` |
| Blank white page in Chrome | stop (Ctrl+C), run `npx expo start --web --clear` |
| `EADDRINUSE 5000` | change `PORT` in `.env` **and** the port in `config.js` |
| Sign in says wrong password after DB change | register a new number |
