import { createChart } from "lightweight-charts";
import { endpoints, langs, commodities } from "./meta.json";
const { bitcoin } = endpoints;

const container = document.getElementById("c-main__chart");

let commodity = "corn";
let lang = "en";

window.addEventListener("DOMContentLoaded", () => {
  redirect();
});

window.addEventListener("load", () => {
  const fillkey = `&api_key=${process.env.QUANDL_API_KEY}`;

  const chart = createChart(container, {
    width: container.clientWidth,
    height: container.clientHeight,
  });

  const lineSeries = chart.addLineSeries({
    color: "gold",
  });

  getSeriesData(endpoints[commodity], fillkey).then(
    ([bitcoinSeries, commoditySeries]) => {
      bitcoinSeries = filterSeries(bitcoinSeries);
      commoditySeries = filterSeries(commoditySeries);

      const normalizedSeries = normalizeDate(bitcoinSeries, commoditySeries);

      renderChart(normalizedSeries, lineSeries);
    }
  );

  window.addEventListener("resize", () => {
    chart.resize(container.clientWidth, container.clientHeight);
  });
});

function redirect() {
  let path = location.pathname.split("/");
  let langIndex = 0;
  let commodityIndex = 0;
  let hasLang = false;
  let hasCommodity = false;
  let redirect = "";

  path.forEach((value, idx) => {
    if (langs.includes(value)) {
      langIndex = idx;
      hasLang = true;
    }

    if (commodities.includes(value)) {
      commodityIndex = idx;
      hasCommodity = true;
    }
  });

  if (!hasLang) {
    redirect = `/${lang}`;
  } else {
    redirect = `/${path[langIndex]}`;
    lang = path[langIndex];
  }

  if (!hasCommodity) {
    redirect += `/${commodity}`;
  } else {
    redirect += `/${path[commodityIndex]}`;
    commodity = path[commodityIndex];
  }

  if (!hasLang || !hasCommodity) {
    location.href = ({}, "", redirect);
  }
}

function getSeriesData(commodityUrl, fillkey) {
  const bitcoinFetchURL = `${bitcoin}${fillkey}`;
  const commodityFetchURL = `${commodityUrl}${fillkey}`;

  return Promise.all([
    fetch(bitcoinFetchURL).then((stream) => stream.json()),
    fetch(commodityFetchURL).then((stream) => stream.json()),
  ]);
}

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

function renderChart(normalizedSeries, lineSeries) {
  lineSeries.setData(normalizedSeries);
}
