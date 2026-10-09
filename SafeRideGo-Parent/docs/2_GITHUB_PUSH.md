# 2. Push to GitHub

Examiners need a repository link + README (Milestone 03 brief). Make it **Public** (or private and add your lecturer).
If your group already has a repo, clone it and copy your folders in instead (see the end).

## A. Create the empty repository (website)
1. GitHub → **+** → **New repository** (the page in your screenshot).
2. Owner `dulaanji`, Repository name `SafeRideGo-Parent`.
3. Visibility **Public**. Leave **Add README = Off**, **.gitignore = No** (we already have both).
4. **Create repository**. Keep the page open – it shows the URL.

## B. Option 1 – GitHub Desktop
1. **File → Add local repository…** → choose the `SafeRideGo-Parent` folder.
2. If it says "not a Git repository" click **create a repository** → leave defaults → **Create repository**.
3. Left panel lists the changed files. Check that **no `.env`** and **no `node_modules`** are listed (they must not be).
4. Summary: `Initial commit – transport app, parent part CRUD` → **Commit to main**.
5. Click **Publish repository** → untick "Keep this code private" if you want Public → **Publish repository**.
6. Later changes: edit → Commit → **Push origin**.

## B. Option 2 – VS Code terminal (same result)
```
cd SafeRideGo-Parent
git init
git add .
git commit -m "Initial commit - transport app, parent part CRUD"
git branch -M main
git remote add origin https://github.com/dulaanji/SafeRideGo-Parent.git
git push -u origin main
```
(First push opens a browser to sign in.)

## C. Check
Open the repo page: you should see `backend`, `parent-app`, `docs`, `README.md`, and **not** `.env`.
If `.env` got pushed by mistake: change the Atlas password immediately, then remove the file from the repo.

## D. Commit as you work
Commit after each screen/feature (`git commit -m "Alerts screen CRUD"`). A real commit history is evidence the code is yours. The brief gives **zero marks for work that isn't the group's own**.

## E. If the group has one shared repo
`git clone <group repo url>` → copy `backend/` and `parent-app/` (or your own sub-folders) into it → commit → push. Agree the folder names with your teammates so the Driver / Admin parts don't clash.
