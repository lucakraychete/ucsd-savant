# 🧠 UCSD Baseball Savant Percentiles (Big West Conference)

An interactive data visualization built with **React + Recharts + Vite** that displays UC San Diego’s **Offense**, **Pitching**, and **Fielding** percentiles vs. the rest of the **Big West Conference**.  
Deployed directly through **GitHub Pages** for easy public access.

---

## 🚀 Features
- **Three Interactive Tabs** – Offense, Pitching, and Fielding  
- **Percentile Radar Charts** – Quickly visualize relative team strengths  
- **Dynamic Metric Tables** – Hover to reveal detailed tooltips and benchmarks  
- **Red / Blue Color Logic** – Blue = above average, Red = below average  
- **PNG Export** – Save the current table as a clean image  
- **Responsive Design** – Works on desktop and mobile  
- **Dark Mode Theme** – Navy background with contrasting white text  

---

## 📊 Data Displayed
### Offense
- wOBA, OPS, AVG  
- BB%, K%, K Looking%  
- SB% (Stolen Base %), HR  

### Pitching
- ERA, WHIP, FIP  
- K, BB, HR Allowed, Opponent AVG  

### Fielding
- FLD%, Errors, SB Against%, Passed Balls, Double Plays  

---

## 🧩 Stack
- **React 18**
- **TypeScript**
- **Vite** (build + dev server)
- **Recharts** (data viz)
- **html-to-image** (table export)
- **Custom CSS** (no Tailwind dependency)

---

## 🧠 Quickstart
```bash
# Clone the repo
git clone https://github.com/<your-username>/ucsd-savant.git
cd ucsd-savant

# Install dependencies
npm install

# Run locally
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to preview.

---

## 🌐 Deploying to GitHub Pages
1. **Edit the repo name** in `vite.config.ts`:
   ```ts
   base: '/ucsd-savant/', // your repo name
   ```
2. Commit and push:
   ```bash
   git add .
   git commit -m "Deploy setup"
   git push origin main
   ```
3. GitHub Actions will automatically build and deploy the site to:  
   **https://<your-username>.github.io/ucsd-savant/**  

If you don’t see it after a few minutes, check the **Actions** tab → “Deploy to GitHub Pages”.

---

## 🧮 Updating Data
Edit the section at the top of `src/App.tsx`:

```ts
teamConfig.sections.Offense.raw.wOBA = 0.398;
teamConfig.sections.Pitching.raw.ERA = 5.42;
teamConfig.sections.Fielding.raw.FLD = 0.975;
```
Adjust the `ranks` and `better` maps accordingly; percentiles and visuals update instantly.

---

## 💡 Example Use Case
This visualization helps UCSD’s baseball analytics team:
- Identify top metrics and weak spots
- Compare seasonal performance vs. conference peers
- Communicate data insights visually to coaches and fans

---

## 📜 License
MIT © 2025 Luca da Costa
