"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Row {
  dateISO: string;
  label: string;
  her: number | null;
  him: number | null;
}

export function MoodChart({
  data,
  herName,
  himName,
}: {
  data: Row[];
  herName: string;
  himName: string;
}) {
  const hasAny = data.some((d) => d.her !== null || d.him !== null);

  if (!hasAny) {
    return (
      <div className="grid h-44 place-items-center rounded-xl bg-rose-50 text-sm text-ink-muted">
        Log a mood to see your chart appear.
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid stroke="#F1E3EA" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#9A9A9A"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <YAxis
            domain={[0.5, 5.5]}
            ticks={[1, 2, 3, 4, 5]}
            stroke="#9A9A9A"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={24}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #F1E3EA",
              boxShadow: "0 4px 16px rgba(233,30,140,0.10)",
              fontSize: 12,
            }}
            formatter={(value, name) => [
              value == null ? "—" : String(value),
              String(name),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#6B6B6B" }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="her"
            name={herName}
            stroke="#E91E8C"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#E91E8C" }}
            activeDot={{ r: 5 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="him"
            name={himName}
            stroke="#A11260"
            strokeWidth={2.5}
            strokeDasharray="4 3"
            dot={{ r: 3, fill: "#A11260" }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
