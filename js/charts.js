import { createChart } from "lightweight-charts";

const container = document.getElementById("c-main__chart");
const chart = createChart(container, {
  width: container.clientWidth,
  height: container.clientHeight,
  timeScale: { barSpacing: 30 },
});

const lineSeries = chart.addLineSeries({
  color: "gold",
});

window.addEventListener("resize", () => {
  chart.resize(container.clientWidth, container.clientHeight);
});

fetch(
  `https://www.quandl.com/api/v3/datasets/BCHAIN/MKPRU/data.json?order=asc&api_key=${process.env.QUANDL_API_KEY}`
).then((stream) =>
  stream.json().then((series) => {
    const lineData = series["dataset_data"].data.flatMap(([time, value]) => ({
      time,
      value,
    }));

    lineSeries.setData(lineData);
    chart.timeScale().fitContent();
  })
);
