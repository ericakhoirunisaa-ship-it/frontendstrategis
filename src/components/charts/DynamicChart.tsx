"use client";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface DataPoint {
  tahun: number;
  daerah: string;
  kolom: string;
  nilai: number;
}

interface Props {
  data: DataPoint[];
  tipeChart: string;
  satuan: string;
  nama: string;
  filterDaerah?: string;
  filterKolom?: string;
}

const COLORS = [
  "#2196F3", "#4CAF50", "#FF9800", "#9C27B0",
  "#F44336", "#00BCD4", "#8BC34A", "#FF5722", "#607D8B", "#795548",
];

function buildChartData(data: DataPoint[], filterDaerah?: string, filterKolom?: string) {
  if (!data.length) return [];

  const uniqueYears = [...new Set(data.map((d) => d.tahun))];
  const isSingleYear = uniqueYears.length === 1;

  if (isSingleYear) {
    // Satu tahun: daerah (kelompok umur) sebagai X-axis, kolom sebagai series
    const filtered = data.filter(
      (d) => !filterDaerah || filterDaerah === "all" || d.daerah === filterDaerah,
    );
    const daerahOrder = [...new Set(data.map((d) => d.daerah))];
    const allKoloms = [...new Set(data.map((d) => d.kolom))];
    const kolomSet =
      !filterKolom || filterKolom === "all" ? allKoloms : [filterKolom];

    return daerahOrder.map((daerah) => {
      const row: Record<string, string | number> = { tahun: daerah };
      for (const kolom of kolomSet) {
        const dp = filtered.find((d) => d.daerah === daerah && d.kolom === kolom);
        if (dp) row[kolom] = dp.nilai;
      }
      return row;
    });
  }

  // Multi-tahun: tahun sebagai X-axis, daerah sebagai series
  const kolom =
    filterKolom && filterKolom !== "all"
      ? filterKolom
      : (data[0]?.kolom ?? "nilai");
  const filtered = data.filter(
    (d) =>
      d.kolom === kolom &&
      (!filterDaerah || filterDaerah === "all" || d.daerah === filterDaerah),
  );
  const tahunSet = [...new Set(filtered.map((d) => d.tahun))].sort();
  const daerahSet = [...new Set(filtered.map((d) => d.daerah))];

  return tahunSet.map((tahun) => {
    const row: Record<string, string | number> = { tahun };
    for (const daerah of daerahSet) {
      const dp = filtered.find((d) => d.tahun === tahun && d.daerah === daerah);
      if (dp) row[daerah] = dp.nilai;
    }
    return row;
  });
}

function getSeriesKeys(chartData: Record<string, string | number>[]) {
  if (!chartData.length) return [];
  return Object.keys(chartData[0]).filter((k) => k !== "tahun");
}

function formatLabel(key: string) {
  return key.replace(/_/g, " ").replace(/-/g, " ");
}

export default function DynamicChart({
  data,
  tipeChart,
  satuan,
  filterDaerah,
  filterKolom,
}: Props) {
  const chartData = buildChartData(data, filterDaerah, filterKolom);
  const seriesKeys = getSeriesKeys(chartData);
  const isSingleYear = [...new Set(data.map((d) => d.tahun))].length === 1;
  const chartHeight = chartData.length > 10 ? 440 : 380;

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Belum ada data untuk indikator ini.
      </div>
    );
  }

  const commonProps = {
    data: chartData,
    margin: { top: 10, right: 20, left: 10, bottom: isSingleYear ? 60 : 10 },
  };

  const axes = {
    grid: <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />,
    xAxis: (
      <XAxis
        dataKey="tahun"
        tick={{ fontSize: isSingleYear ? 10 : 12 }}
        interval={0}
        angle={isSingleYear ? -35 : 0}
        textAnchor={isSingleYear ? "end" : "middle"}
        height={isSingleYear ? 70 : 30}
      />
    ),
    yAxis: <YAxis tick={{ fontSize: 12 }} unit={` ${satuan}`} width={85} />,
    tooltip: (
      <Tooltip
        formatter={(v, name) => [
          `${Number(v).toLocaleString("id-ID")} ${satuan}`,
          formatLabel(String(name)),
        ]}
        contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
      />
    ),
    legend:
      seriesKeys.length > 1 ? (
        <Legend formatter={(v) => formatLabel(v)} />
      ) : null,
  };

  if (tipeChart === "line") {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart {...commonProps}>
          {axes.grid}{axes.xAxis}{axes.yAxis}{axes.tooltip}{axes.legend}
          {seriesKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (tipeChart === "area") {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart {...commonProps}>
          {axes.grid}{axes.xAxis}{axes.yAxis}{axes.tooltip}{axes.legend}
          {seriesKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length] + "30"}
              strokeWidth={2.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart {...commonProps}>
        {axes.grid}{axes.xAxis}{axes.yAxis}{axes.tooltip}{axes.legend}
        {seriesKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            name={key}
            fill={COLORS[i % COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
