import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/**
 * UCSD Savant Percentiles – Dark Mode Red/Blue Visualization
 * --------------------------------------------------
 * Design:
 * - Background: Dark Navy Blue (#0B132B)
 * - Text: White (#FFFFFF)
 * - Color Logic:
 *    - Blue (#2E8BFF) = Positive / Good percentile (>50)
 *    - Red  (#FF3B3B) = Negative / Below average percentile (<50)
 * - Context: 25/50/75 rings, median ring dashed
 * - Chart: Radar for overview + detailed percentile bars
 */

const teamConfig = {
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
    },
    Pitching: {
      // From your conference table (lower ERA/BB/HR/BAVG is better)
      raw: {
        ERA: 5.68,
        WHIP: 1.59,
        FIP: 5.70, // Big West‑normalized from earlier
        K: 411,
        BB: 202,
        HRAllowed: 47,
        BAVG: 0.285,
      },
      ranks: {
        ERA: 7,
        WHIP: 6,
        FIP: 6,
        K: 8, // UCR 412 nudges UCSD to 8th
        BB: 3, // fewest walks allowed rank
        HRAllowed: 6,
        BAVG: 7,
      },
      better: {
        ERA: false,
        WHIP: false,
        FIP: false,
        K: true,
        BB: false, // fewer is better
        HRAllowed: false,
        BAVG: false,
      },
    },
    Fielding: {
      raw: {
        FLD: 0.972,
        Errors: 52,
        SBAgainstPct: 0.734, // opponents SB success vs UCSD (lower better)
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

const METRIC_META: Record<string, { label: string; format: (v:number)=>string }> = {
  // Offense
  wOBA: { label: "wOBA", format: v=>v.toFixed(3) },
  OPS: { label: "OPS", format: v=>v.toFixed(3) },
  AVG: { label: "AVG", format: v=>v.toFixed(3) },
  BBpct: { label: "BB%", format: v=>(v*100).toFixed(1)+"%" },
  Kpct: { label: "K%", format: v=>(v*100).toFixed(1)+"%" },
  KLookingPct: { label: "K Looking%", format: v=>(v*100).toFixed(1)+"%" },
  SBpct: { label: "SB%", format: v=>(v*100).toFixed(0)+"%" },
  HR: { label: "HR", format: v=>String(Math.round(v)) },
  // Pitching
  ERA: { label: "ERA", format: v=>v.toFixed(2) },
  WHIP: { label: "WHIP", format: v=>v.toFixed(2) },
  FIP: { label: "FIP", format: v=>v.toFixed(2) },
  K: { label: "K", format: v=>String(Math.round(v)) },
  BB: { label: "BB", format: v=>String(Math.round(v)) },
  HRAllowed: { label: "HR Allowed", format: v=>String(Math.round(v)) },
  BAVG: { label: "Opp BAVG", format: v=>v.toFixed(3) },
  // Fielding
  FLD: { label: "FLD%", format: v=>v.toFixed(3) },
  Errors: { label: "Errors", format: v=>String(Math.round(v)) },
  SBAgainstPct: { label: "SB Against%", format: v=>(v*100).toFixed(1)+"%" },
  PB: { label: "Passed Balls", format: v=>String(Math.round(v)) },
  DPs: { label: "Double Plays", format: v=>String(Math.round(v)) },
};

function rankToPercentile(rank, total, higherIsBetter = true) {
  const orientedRank = higherIsBetter ? rank : (total - rank + 1);
  const pct = ((total - orientedRank) / (total - 1)) * 100;
  return Math.max(0, Math.min(100, pct));
}

export default function UcsdSavant() {
  const { totalTeams, teamName, sections } = teamConfig as any;
  const [tab, setTab] = React.useState<'Offense'|'Pitching'|'Fielding'>('Offense');
  const sec = sections[tab];
  const raw = sec.raw as Record<string, number>;
  const ranks = sec.ranks as Record<string, number>;
  const better = (sec as any).better || {};
  const metricKeys = Object.keys(raw);

  const rows = useMemo(() => metricKeys.map((k) => {
    const higherIsBetter = better[k] ?? true;
    const percentile = rankToPercentile(ranks[k], totalTeams, higherIsBetter);
    const color = percentile >= 50 ? "#2E8BFF" : "#FF3B3B";
    const betterText = higherIsBetter ? "Higher is better" : "Lower is better";
    return {
      key: k,
      label: METRIC_META[k]?.label || k,
      raw: raw[k],
      rank: ranks[k],
      percentile,
      color,
      display: (METRIC_META[k]?.format || ((v:number)=>String(v)))(raw[k]),
      betterText,
    };
  }), [raw, ranks, totalTeams, metricKeys.join(','), tab]);

  const radarData = rows.map(r => ({ metric: r.label, Percentile: Math.round(r.percentile) }));

  return (
    <div className="min-h-screen w-full p-6" style={{ background: "#0B132B", color: "#FFFFFF" }}>
      <motion.h1 initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} className="text-3xl font-bold mb-4">
        {teamName} – Savant Percentiles
      </motion.h1>
      <div className="inline-flex items-center gap-2 mb-6 bg-[#16213E] rounded-xl p-1 text-sm">
        {(['Offense','Pitching','Fielding'] as const).map(name => (
          <button key={name} onClick={()=>setTab(name)}
                  className={`px-3 py-1 rounded-lg transition ${name===tab? 'bg-white text-[#0B132B]' : 'text-white hover:bg-white/10'}`}>
            {name}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-300 mb-6">Blue = Above Average (Good) | Red = Below Average (Needs Work). Hover any value for details.</p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Radar Chart */}
        <Card className="md:col-span-2 bg-[#16213E] border-none text-white rounded-2xl">
          <CardContent className="p-4 h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid stroke="#1F4068" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#FFFFFF", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#AAAAAA", fontSize: 10 }} />
                <Radar name="UCSD" dataKey="Percentile" stroke="#2E8BFF" fill="#2E8BFF" fillOpacity={0.3} />
                <Tooltip wrapperStyle={{ background: "#16213E", color: "white", border: '1px solid #2E8BFF' }} formatter={(v)=>`${v} pct`} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="md:col-span-3 bg-[#16213E] border-none text-white rounded-2xl">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Metric Table</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-2 pr-4">Metric</th>
                  <th className="py-2 pr-4">Raw</th>
                  <th className="py-2 pr-4">Rank</th>
                  <th className="py-2 pr-4">Percentile</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.key} className="border-b border-gray-700 last:border-0">
                    <td className="py-2 pr-4 font-medium">{r.label}</td>
                    <td className="py-2 pr-4">
                      <HoverValue label={r.label} value={r.display} raw={String(r.raw)} betterText={r.betterText} />
                    </td>
                    <td className="py-2 pr-4">
                      <HoverValue label="Rank" value={`${r.rank}/${totalTeams}`} raw={`${r.rank}`} betterText="1 is best" />
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="relative w-48 h-2 bg-gray-700 rounded-full overflow-hidden group">
                          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-400/70" />
                          <div className="h-full transition-all duration-300" style={{ width: `${r.percentile}%`, background: r.color }} />
                          {/* Tooltip for the bar */}
                          <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="px-2 py-1 rounded bg-black/80 text-white text-xs whitespace-nowrap border" style={{borderColor: r.color}}>
                              {r.label}: {Math.round(r.percentile)} pct • {r.betterText}
                            </div>
                          </div>
                        </div>
                        <HoverValue label="Percentile" value={String(Math.round(r.percentile))} raw={`${r.percentile.toFixed(1)}`} betterText={r.betterText} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Clear Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <TipCard color="#2E8BFF" title="Strengths" text="Elite Power (HR, OPS, wOBA). Strong on-base discipline." />
        <TipCard color="#2E8BFF" title="Neutral" text="Average contact quality and strikeout rates." />
        <TipCard color="#FF3B3B" title="Weaknesses" text="Low stolen base efficiency; speed opportunity." />
      </div>
    </div>
  );
}

function HoverValue({ label, value, raw, betterText }: { label: string; value: string; raw: string; betterText: string }) {
  return (
    <span className="relative inline-flex items-center group">
      <span className="tabular-nums underline decoration-dotted underline-offset-4">{value}</span>
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="px-2 py-1 rounded bg-black/80 text-white text-xs whitespace-nowrap border border-white/20 shadow">
          {label}: {value} • raw {raw} • {betterText}
        </span>
      </span>
    </span>
  );
}

function TipCard({ color, title, text }: { color: string; title: string; text: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: '#1F4068', border: `1px solid ${color}40` }}>
      <h3 className="font-semibold mb-1" style={{ color }}>{title}</h3>
      <p className="text-sm text-gray-200">{text}</p>
    </div>
  );
}
