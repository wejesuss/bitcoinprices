import { createChart } from "lightweight-charts";

const container = document.getElementById("c-main__chart");
const chart = createChart(container, {
  width: container.clientWidth,
  height: container.clientHeight,
  timeScale: { barSpacing: 30 },
});

const lineSeries2 = chart.addLineSeries({
  color: "gold",
});

const lineSeries = chart.addLineSeries();
lineSeries.setData([
  { time: "2019-04-11", value: 80.01 },
  { time: "2019-04-12", value: 96.63 },
  { time: "2019-04-13", value: 76.64 },
  { time: "2019-04-14", value: 81.89 },
  { time: "2019-04-15", value: 74.43 },
  { time: "2019-04-16", value: 80.01 },
  { time: "2019-04-17", value: 96.63 },
  { time: "2019-04-18", value: 76.64 },
  { time: "2019-04-19", value: 81.89 },
  { time: "2019-04-20", value: 74.43 },
]);
window.addEventListener("resize", () => {
  chart.resize(container.clientWidth, container.clientHeight);
});

lineSeries2.setData([
  { time: "2019-04-10", value: 70.01 },
  { time: "2019-04-12", value: 236.63 },
  { time: "2019-04-13", value: 326.64 },
  { time: "2019-04-14", value: 11.89 },
  { time: "2019-04-15", value: 44.43 },
  { time: "2019-04-16", value: 560.01 },
  { time: "2019-04-17", value: 86.63 },
  { time: "2019-04-18", value: 16.64 },
  { time: "2019-04-19", value: 51.89 },
  { time: "2019-04-20", value: 44.43 },
]);

console.log(lineSeries);
