import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import * as htmlToImage from "html-to-image";

/* ------------------------- Typed metric key unions ------------------------- */
type OffenseKey =
  | "wOBA"
  | "OPS"
  | "AVG"
  | "BBpct"
  | "Kpct"
  | "KLookingPct"
  | "SBpct"
  | "HR";

type PitchingKey =
  | "ERA"
  | "WHIP"
  | "FIP"
  | "K"
  | "BB"
  | "HRAllowed"
  | "BAVG";

type FieldingKey = "FLD" | "Errors" | "SBAgainstPct" | "PB" | "DPs";

type AllMetricKey = OffenseKey | PitchingKey | FieldingKey;

/* -------------------------- Section + Config types ------------------------- */
type Section<RKeys extends string> = {
  raw: Record<RKeys, number>;
  ranks: Record<RKeys, number>;
  /** true = higher is better; false = lower is better */
  better: Record<RKeys, boolean>;
};

type Sections = {
  Offense: Section<OffenseKey>;
  Pitching: Section<PitchingKey>;
  Fielding: Section<FieldingKey>;
};

type TeamConfig = {
  teamName: string;
  totalTeams: number;
  sections: Sections;
};

/* ------------------------------ App data (typed) --------------------------- */
const teamConfig: TeamConfig = {
  teamName: "UC San Diego (2025)",
  totalTeams: 11,
  sections: {
    Offense: {
      raw: {
        wOBA: 0.394,
        OPS: 0.896,
        AVG: 0.279,
        BBpct: 0.128,
        Kpct: 0.221,
        KLookingPct: 0.247,
        SBpct: 0.68,
        HR: 80,
      },
      ranks: {
        wOBA: 2,
        OPS: 2,
        AVG: 7,
        BBpct: 4,
        Kpct: 6,
        KLookingPct: 4,
        SBpct: 9,
        HR: 1,
      },
      better: {
        wOBA: true,
        OPS: true,
        AVG: true,
        BBpct: true,
        Kpct: false,
        KLookingPct: false,
        SBpct: true,
        HR: true,
      },
    },
    Pitching: {
      raw: {
        ERA: 5.68,
        WHIP: 1.59,
        FIP: 5.70,
        K: 411,
        BB: 202,
        HRAllowed: 47,
        BAVG: 0.285,
      },
      ranks: {
        ERA: 7,
        WHIP: 6,
        FIP: 6,
        K: 8, // (UCR 412 vs UCSD 411)
        BB: 3, // fewer walks allowed = better
        HRAllowed: 6,
        BAVG: 7,
      },
      better: {
        ERA: false,
        WHIP: false,
        FIP: false,
        K: true,
        BB: false,
        HRAllowed: false,
        BAVG: false,
      },
    },
    Fielding: {
      raw: {
        FLD: 0.972,
        Errors: 52,
        SBAgainstPct: 0.734,
        PB: 8,
        DPs: 35,
      },
      ranks: {
        FLD: 7,
        Errors: 5,
        SBAgainstPct: 6,
        PB: 5,
        DPs: 7,
      },
      better: {
        FLD: true,
        Errors: false,
        SBAgainstPct: false,
        PB: false,
        DPs: true,
      },
    },
  },
};

/* ----------------------------- Formatters (typed) -------------------------- */
const LABELS: Record<AllMetricKey, (v: number) => string> = {
  // Offense
  wOBA: (v) => v.toFixed(3),
  OPS: (v) => v.toFixed(3),
  AVG: (v) => v.toFixed(3),
  BBpct: (v) => (v * 100).toFixed(1) + "%",
  Kpct: (v) => (v * 100).toFixed(1) + "%",
  KLookingPct: (v) => (v * 100).toFixed(1) + "%",
  SBpct: (v) => (v * 100).toFixed(0) + "%",
  HR: (v) => String(Math.round(v)),
  // Pitching
  ERA: (v) => v.toFixed(2),
  WHIP: (v) => v.toFixed(2),
  FIP: (v) => v.toFixed(2),
  K: (v) => String(Math.round(v)),
  BB: (v) => String(Math.round(v)),
  HRAllowed: (v) => String(Math.round(v)),
  BAVG: (v) => v.toFixed(3),
  // Fielding
  FLD: (v) => v.toFixed(3),
  Errors: (v) => String(Math.round(v)),
  SBAgainstPct: (v) => (v * 100).toFixed(1) + "%",
  PB: (v) => String(Math.round(v)),
  DPs: (v) => String(Math.round(v)),
};

/* ----------------------------- Helper functions ---------------------------- */
function rankToPercentile(
  rank: number,
  total: number,
  higherIsBetter: boolean
): number {
  const oriented = higherIsBetter ? rank : total - rank + 1;
  const pct = ((total - oriented) / (total - 1)) * 100;
  return Math.max(0, Math.min(100, pct));
}

type Row = {
  key: string;
  label: string;
  value: string;
  raw: number;
  rank: number;
  percentile: number;
  color: string;
  higher: boolean;
};

function rowsForSection<K extends string>(
  sec: Section<K>,
  totalTeams: number
): Row[] {
  const keys = Object.keys(sec.raw) as K[];
  return keys.map((k) => {
    const higher = sec.better[k];
    const percentile = rankToPercentile(sec.ranks[k], totalTeams, higher);
    const color = percentile >= 50 ? "var(--good)" : "var(--bad)";
    const label =
      (k as string)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase()) || (k as string);
    const formatter = LABELS[k as AllMetricKey];
    return {
      key: String(k),
      label,
      value: formatter(sec.raw[k]),
      raw: sec.raw[k],
      rank: sec.ranks[k],
      percentile,
      color,
      higher,
    };
  });
}

/* --------------------------------- App ------------------------------------- */
export default function App() {
  const [tab, setTab] = React.useState<keyof Sections>("Offense");

  const offenseRows = React.useMemo(
    () => rowsForSection(teamConfig.sections.Offense, teamConfig.totalTeams),
    []
  );
  const pitchingRows = React.useMemo(
    () => rowsForSection(teamConfig.sections.Pitching, teamConfig.totalTeams),
    []
  );
  const fieldingRows = React.useMemo(
    () => rowsForSection(teamConfig.sections.Fielding, teamConfig.totalTeams),
    []
  );

  const rows =
    tab === "Offense"
      ? offenseRows
      : tab === "Pitching"
      ? pitchingRows
      : fieldingRows;

  const radarData = rows.map((r) => ({
    metric: r.label,
    Percentile: Math.round(r.percentile),
  }));

  const exportTable = async () => {
    const el = document.querySelector("#table-wrap") as HTMLElement | null;
    if (!el) return;
    const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `ucsd-${tab.toLowerCase()}-table.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="container">
      <div className="h1">{teamConfig.teamName}</div>
      <div className="tabs">
        {(["Offense", "Pitching", "Fielding"] as const).map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
        <a className="button" style={{ marginLeft: 12 }} onClick={exportTable} href="#">
          Export PNG
        </a>
      </div>

      <div className="grid">
        <div className="card" style={{ height: 440 }}>
          <h2>{tab} – Radar</h2>
          <div style={{ width: "100%", height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid stroke="var(--grid)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "var(--text)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#c7d2fe", fontSize: 10 }}
                />
                <Radar
                  name="UCSD"
                  dataKey="Percentile"
                  stroke="var(--good)"
                  fill="var(--good)"
                  fillOpacity={0.28}
                />
                <Tooltip
                  wrapperStyle={{
                    background: "var(--panel)",
                    border: "1px solid #2E8BFF80",
                    color: "var(--text)",
                  }}
                  // recharts doesn't type formatter's params strictly; keep it generic without 'any'
                  formatter={(v: unknown) => `${String(v)} pct`}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            <span>
              <span className="sw" style={{ background: "var(--good)" }}></span>
              Above average
            </span>
            <span>
              <span className="sw" style={{ background: "var(--bad)" }}></span>
              Below average
            </span>
          </div>
        </div>

        <div className="card" id="table-wrap">
          <h2>{tab} – Metric Table</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Raw</th>
                <th>Rank</th>
                <th>Percentile</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td>{r.label}</td>
                  <td
                    className="hoverable"
                    style={{
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                    }}
                  >
                    {r.value}
                    <span className="tip tooltip">
                      Raw: {r.raw} • {r.higher ? "Higher is better" : "Lower is better"}
                    </span>
                  </td>
                  <td className="hoverable">
                    {r.rank}/{teamConfig.totalTeams}
                    <span className="tip tooltip">1 is best</span>
                  </td>
                  <td>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <div className="bar">
                        <div className="mid"></div>
                        <div
                          className="fill"
                          style={{ width: `${r.percentile}%`, background: r.color }}
                        ></div>
                      </div>
                      <div className="tip tooltip">
                        {Math.round(r.percentile)} pct •{" "}
                        {r.higher ? "Higher is better" : "Lower is better"}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="kpis">
            <div className="kpi">
              Best: <b>{rows.reduce((a, b) => (a.percentile > b.percentile ? a : b)).label}</b>
            </div>
            <div className="kpi">
              Needs work:{" "}
              <b>{rows.reduce((a, b) => (a.percentile < b.percentile ? a : b)).label}</b>
            </div>
            <div className="kpi">
              Median pct:{" "}
              <b>
                {
                  Math.round(
                    [...rows.map((r) => r.percentile)]
                      .sort((a, b) => a - b)[Math.floor(rows.length / 2)]
                  )
                }
              </b>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <div className="chip">
          <h3>Strengths</h3>
          <div>Power (HR, OPS, wOBA). Discipline (BB%).</div>
        </div>
        <div className="chip">
          <h3>Neutral</h3>
          <div>Contact (AVG, K%).</div>
        </div>
        <div className="chip" style={{ borderColor: "var(--bad)" }}>
          <h3>Weaknesses</h3>
          <div>SB% and fielding efficiency.</div>
        </div>
      </div>
    </div>
  );
}
