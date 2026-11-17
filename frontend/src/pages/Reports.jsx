import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line, ComposedChart, Area
} from "recharts";
import { api } from "../api.js";
import Topbar from "../components/Topbar.jsx";
import { useToast } from "../App.jsx";

const PALETTE = ["#a8823c", "#4a5d43", "#3d4a52", "#8a4a3a", "#c9a86a", "#6d7f64", "#5a6d78", "#b06a58"];

const tooltipStyle = {
  contentStyle: {
    background: "#fdfaf5",
    border: "1px solid rgba(28,26,23,0.1)",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "JetBrains Mono, monospace",
    boxShadow: "0 4px 16px rgba(28,26,23,0.08)",
  },
};

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card p-5 animate-slide-up">
      <div className="mb-4">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-ink/40 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Reports() {
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getAnalytics().then(setData).catch((e) => toast(e.message, "error"));
  }, []);

  if (!data) return (
    <div>
      <div className="h-16 skeleton rounded-lg mb-7" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><div className="skeleton h-72 w-full" /></div>
        <div className="card p-5"><div className="skeleton h-72 w-full" /></div>
      </div>
      <div className="card p-5"><div className="skeleton h-64 w-full" /></div>
    </div>
  );

  const maxIssues = Math.max(...(data.issue_history?.map(d => d.issues) || [1]), 1);

  return (
    <div>
      <Topbar title="Reports & Analytics" subtitle="Collection composition and weekly circulation trends." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Genre Distribution" subtitle="Copies held per subject area">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.genre_distribution} dataKey="copies" nameKey="genre"
                cx="50%" cy="50%" outerRadius={100} paddingAngle={2}
                label={({ genre, percent }) => percent > 0.05 ? genre : ""}
                labelLine={false}
              >
                {data.genre_distribution.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v, n) => [`${v} copies`, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Member Breakdown" subtitle="Registered members by category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.member_breakdown} dataKey="n" nameKey="type"
                cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}
              >
                {data.member_breakdown.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v, n) => [`${v} members`, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Circulation — Last 7 Days" subtitle="Issues, returns, and fines collected per day">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data.issue_history} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,26,23,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", fill: "#1c1a1780" }}
              tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#1c1a1760" }} allowDecimals={false}
              axisLine={false} tickLine={false} width={28} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#1c1a1760" }}
              axisLine={false} tickLine={false} width={36}
              tickFormatter={(v) => `₹${v}`} />
            <Tooltip {...tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
            <Bar yAxisId="left" dataKey="issues" name="Issues" fill="#a8823c" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="returns" name="Returns" fill="#4a5d43" radius={[4, 4, 0, 0]} />
            <Area yAxisId="right" type="monotone" dataKey="fines_collected" name="Fines (₹)"
              fill="rgba(138,74,58,0.08)" stroke="#8a4a3a" strokeWidth={2} dot={{ r: 3, fill: "#8a4a3a" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Issue history table */}
      <div className="card overflow-x-auto mt-6 animate-slide-up animate-delay-200">
        <div className="section-header">
          <h2 className="font-display text-base font-semibold">Daily Summary</h2>
          <span className="text-[10.5px] font-mono text-ink/35">last 7 days</span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th-ledger">Date</th>
              <th className="th-ledger">Issues</th>
              <th className="th-ledger">Returns</th>
              <th className="th-ledger">Fines Collected</th>
              <th className="th-ledger">Net Activity</th>
            </tr>
          </thead>
          <tbody>
            {data.issue_history.map((r) => (
              <tr key={r.date} className="tr-hover">
                <td className="td-ledger font-mono text-xs text-ink/60">{r.date}</td>
                <td className="td-ledger">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-brass" style={{ width: `${Math.max((r.issues / maxIssues) * 48, 2)}px` }} />
                    <span className="font-mono text-sm">{r.issues}</span>
                  </div>
                </td>
                <td className="td-ledger">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-moss" style={{ width: `${Math.max((r.returns / maxIssues) * 48, 2)}px` }} />
                    <span className="font-mono text-sm">{r.returns}</span>
                  </div>
                </td>
                <td className="td-ledger font-mono text-sm font-medium text-rust">
                  {r.fines_collected > 0 ? `₹${r.fines_collected}` : "—"}
                </td>
                <td className="td-ledger">
                  <span className={`badge-${r.issues >= r.returns ? "brass" : "moss"}`}>
                    {r.issues >= r.returns ? `+${r.issues - r.returns} issued` : `+${r.returns - r.issues} returned`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
