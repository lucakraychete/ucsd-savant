
# UCSD Baseball Analytics (Python + Google Colab + GitHub Pages)

This repo shows a **minimal** setup to:
- keep your data & notebook on **GitHub**
- open & run the notebook in **Google Colab**
- export interactive **Plotly** charts as static HTML into the `docs/` folder
- host the results via **GitHub Pages**

## Quick Start

1. Create a GitHub repo (public): `ucsd-baseball-analytics` and upload these files.
2. In Colab, open the notebook from GitHub or click a Colab badge (replace `YOUR-USER` below once pushed):
   - https://colab.research.google.com/github/**YOUR-USER**/ucsd-baseball-analytics/blob/main/notebooks/UCSD_Baseball_Analytics.ipynb
3. Run the notebook cells. They will load CSVs from your GitHub repo, build charts, and show how to export HTML to `docs/`.
4. Commit the exported HTML files to `docs/` and enable **GitHub Pages**:
   - Repo → Settings → Pages → Source: `main` branch, `/docs` folder.

## Repo layout

```
.
├─ data/
│  ├─ hitters.csv
│  └─ pitchers.csv
├─ notebooks/
│  └─ UCSD_Baseball_Analytics.ipynb
├─ docs/
│  └─ index.html
└─ requirements.txt
```

## Notes
- Colab already has pandas & plotly; `requirements.txt` is for local usage.
- For real data, replace CSVs in `/data` or host them elsewhere.
- The notebook contains a **single place** to set your GitHub username & repo.
