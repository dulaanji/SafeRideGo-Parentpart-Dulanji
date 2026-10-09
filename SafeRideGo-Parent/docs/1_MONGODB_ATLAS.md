# 1. MongoDB Atlas – connect the backend

You already have: Organization **sliit** → Project **Project 0** → **Cluster0** (FREE, ACTIVE). Use that. No new cluster needed.

## A. Database user (username + password for the backend)
1. Atlas left menu → **Security → Database Access** (called "Database Users" in your screenshot).
2. **Add New Database User** → Authentication: *Password*.
3. Username: `saferide_user`. Password: use **letters and numbers only** (e.g. `Saferide2026x`) – special characters break the connection string.
4. Built-in role: **Read and write to any database** → **Add User**.

## B. Network access
Your IP Access List already has `0.0.0.0/0` ("Allow all (dev)"), so any PC can connect. Nothing to change.
(For a real deployment you would delete this and allow only the server IP.)

## C. Get the connection string
1. **Database → Clusters** → on Cluster0 click **Connect** → **Drivers**.
2. Driver: **Node.js**. Copy the string. It looks like:
   `mongodb+srv://saferide_user:<db_password>@cluster0.abcde.mongodb.net/?appName=Cluster0`
3. Edit it in 2 places:
   - replace `<db_password>` with your real password (no `<` `>`)
   - add the database name `saferidego` **before** the `?`
   `mongodb+srv://saferide_user:Saferide2026x@cluster0.abcde.mongodb.net/saferidego?appName=Cluster0`

## D. Put it in the backend
```
cd backend
copy .env.example .env
```
Open `.env` in VS Code:
```
PORT=5000
MONGO_URI=mongodb+srv://saferide_user:Saferide2026x@cluster0.abcde.mongodb.net/saferidego?appName=Cluster0
JWT_SECRET=anyLongRandomTextYouLike123456
```
`.env` is in `.gitignore`, so the password never goes to GitHub.

## E. Check it works
```
npm install
npm run dev
```
You must see:
```
MongoDB connected
API running on port 5000
```
Open http://localhost:5000 → `{"ok":true,"app":"SafeRideGo Transport API (Parent part)"}`.
After you register one parent in the app: Atlas → **Browse collections** → database `saferidego` → collections `parents`, `children`, `journeys`, `trips`, `alerts`, `pickupnotes`, `feedbacks`, `sessions` appear (screenshots for the report appendix).

## Problems
| Message | Fix |
|---|---|
| `bad auth : Authentication failed` | wrong password/username, or password has special characters → reset the user's password to letters+numbers |
| `querySrv ECONNREFUSED` / `ENOTFOUND` | campus Wi-Fi/DNS blocks SRV lookups → use your phone's hotspot |
| `MongooseServerSelectionError` | IP list changed → check Network Access has `0.0.0.0/0` |
| `Cannot read properties of undefined (reading 'startsWith')` | `.env` missing or `MONGO_URI` empty |
