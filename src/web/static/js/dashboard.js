const charts = {
  topMovies: echarts.init(document.getElementById("topMoviesChart")),
  gender: echarts.init(document.getElementById("genderChart")),
  stream: echarts.init(document.getElementById("streamChart")),
};

const numberFormat = new Intl.NumberFormat("zh-CN");

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || `请求失败: ${url}`);
  }
  return payload;
}

function setMetric(id, value) {
  document.getElementById(id).textContent = Number.isFinite(Number(value))
    ? numberFormat.format(Number(value))
    : "-";
}

async function loadSummary() {
  const payload = await fetchJson("/api/summary");
  const data = Object.fromEntries(payload.data.map((row) => [row.label, row.value]));
  setMetric("metricMovies", data.movies);
  setMetric("metricRatings", data.ratings);
  setMetric("metricUsers", data.users);
  setMetric("metricGenres", data.genres);
}

async function loadTopMovies() {
  const payload = await fetchJson("/api/top-movies");
  const rows = payload.data;
  const titles = rows.map((row) => `${row.rank_no}. ${row.title}`);
  const values = rows.map((row) => Number(row.avg_rating));

  charts.topMovies.setOption({
    color: ["#1e40af"],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { top: 8, right: 24, bottom: 8, left: 180, containLabel: true },
    xAxis: {
      type: "value",
      min: 0,
      max: 5,
      axisLabel: { color: "#475569" },
      splitLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "category",
      data: titles.reverse(),
      axisLabel: {
        color: "#334155",
        width: 220,
        overflow: "truncate",
      },
    },
    series: [
      {
        name: "平均分",
        type: "bar",
        data: values.reverse(),
        barWidth: 16,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: "right",
          color: "#172033",
          formatter: ({ value }) => Number(value).toFixed(2),
        },
      },
    ],
  });

  const tbody = document.getElementById("topMovieRows");
  tbody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.rank_no}</td>
          <td>${row.title}</td>
          <td>${Number(row.avg_rating).toFixed(3)}</td>
          <td>${numberFormat.format(row.rating_count)}</td>
        </tr>
      `,
    )
    .join("");
}

async function loadGenderGenres() {
  const payload = await fetchJson("/api/gender-genres");
  const genres = [...new Set(payload.data.map((row) => row.genre))];
  const female = genres.map((genre) => {
    const row = payload.data.find((item) => item.genre === genre && item.gender === "F");
    return row ? Number(row.attention_count) : 0;
  });
  const male = genres.map((genre) => {
    const row = payload.data.find((item) => item.genre === genre && item.gender === "M");
    return row ? Number(row.attention_count) : 0;
  });

  charts.gender.setOption({
    color: ["#0f766e", "#f59e0b"],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { top: 0, textStyle: { color: "#475569" } },
    grid: { top: 44, right: 18, bottom: 64, left: 54, containLabel: true },
    xAxis: {
      type: "category",
      data: genres,
      axisLabel: { rotate: 45, color: "#475569" },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#475569" },
      splitLine: { lineStyle: { color: "#e2e8f0" } },
    },
    series: [
      { name: "女性", type: "bar", data: female, barGap: 0, itemStyle: { borderRadius: [4, 4, 0, 0] } },
      { name: "男性", type: "bar", data: male, itemStyle: { borderRadius: [4, 4, 0, 0] } },
    ],
  });

  document.getElementById("topGenreNote").textContent = payload.tops
    .map((row) => `${row.gender === "F" ? "女性" : "男性"}关注最多：${row.genre}（${numberFormat.format(row.attention_count)}）`)
    .join("；");
}

async function loadStreamTrend() {
  const payload = await fetchJson("/api/stream-trend");
  const rows = payload.data;
  charts.stream.setOption({
    color: ["#1e40af", "#b91c1c"],
    tooltip: { trigger: "axis" },
    legend: { top: 0, textStyle: { color: "#475569" } },
    grid: { top: 44, right: 20, bottom: 36, left: 58, containLabel: true },
    xAxis: {
      type: "category",
      data: rows.map((row) => row.batch_time || `批次${row.batch_id}`),
      axisLabel: { color: "#475569" },
    },
    yAxis: [
      {
        type: "value",
        name: "平均分",
        min: 0,
        max: 5,
        axisLabel: { color: "#475569" },
        splitLine: { lineStyle: { color: "#e2e8f0" } },
      },
      {
        type: "value",
        name: "记录数",
        axisLabel: { color: "#475569" },
      },
    ],
    series: [
      {
        name: "平均分",
        type: "line",
        smooth: true,
        data: rows.map((row) => Number(row.avg_rating)),
        symbolSize: 7,
      },
      {
        name: "记录数",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: rows.map((row) => Number(row.rating_count)),
        symbolSize: 7,
      },
    ],
  });
}

async function refreshDashboard() {
  const button = document.getElementById("refreshButton");
  button.disabled = true;
  button.textContent = "刷新中";
  try {
    await Promise.all([loadSummary(), loadTopMovies(), loadGenderGenres(), loadStreamTrend()]);
  } catch (error) {
    console.error(error);
  } finally {
    button.disabled = false;
    button.textContent = "刷新数据";
  }
}

window.addEventListener("resize", () => {
  Object.values(charts).forEach((chart) => chart.resize());
});

document.getElementById("refreshButton").addEventListener("click", refreshDashboard);
refreshDashboard();
setInterval(loadStreamTrend, 6000);

