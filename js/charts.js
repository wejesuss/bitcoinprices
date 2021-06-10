import { createChart } from "lightweight-charts";
import { bitcoinURL, cornURL } from "./commodities.json";

const fillkey = `&api_key=${process.env.QUANDL_API_KEY}`;

const container = document.getElementById("c-main__chart");
const chart = createChart(container, {
  width: container.clientWidth,
  height: container.clientHeight,
});

const lineSeries = chart.addLineSeries({
  color: "gold",
});

window.addEventListener("resize", () => {
  chart.resize(container.clientWidth, container.clientHeight);
});

Promise.all([
  fetch(`${bitcoinURL}${fillkey}`).then((stream) => stream.json()),
  fetch(`${cornURL}${fillkey}`).then((stream) => stream.json()),
]).then(([bitcoinSeries, commoditySeries]) => {
  const firstlineData = filterSeries(bitcoinSeries);
  const secondlineData = filterSeries(commoditySeries);

  const normalizedSeries = normalizeDate(firstlineData, secondlineData);
  lineSeries.setData(normalizedSeries);
});

function filterSeries(series) {
  const lineData = series["dataset_data"].data.flatMap(([time, value]) => ({
    time,
    value,
  }));

  return lineData;
}

function normalizeDate(bitcoinSeries, commoditySeries) {
  let i = 0;
  let t = 0;
  const normalizedSeries = [];

  const bitcoinSeriesLength = bitcoinSeries.length;
  const commoditySeriesLength = commoditySeries.length;

  while (i < bitcoinSeriesLength && t < commoditySeriesLength) {
    const bitcoinDate = bitcoinSeries[i].time;
    const commodityDate = commoditySeries[t].time;

    if (bitcoinDate === commodityDate && bitcoinSeries[i].value !== 0) {
      normalizedSeries.push({
        time: bitcoinDate,
        value: (
          (commoditySeries[t].value / bitcoinSeries[i].value) *
          1000000
        ).toFixed(2),
      });

      i++;
      t++;
    } else if (bitcoinDate < commodityDate) {
      i++;
    } else {
      t++;
    }
  }

  return normalizedSeries;
}
