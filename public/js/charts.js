const createChart = LightweightCharts.createChart;
const container = document.getElementById("c-main__chart");

class Series {
  _key = "";
  _minimumGap = 1 * 60 * 60 * 1000;

  constructor(key = "series") {
    this._key = key;
  }

  _verifyDate = function (oldTimestamp, newTimestamp) {
    // verify if it should update storage using time information
    return oldTimestamp + this._minimumGap <= newTimestamp;
  };

  _verifyDataSeries = function (dataSeries) {
    // verify if it should update storage using data_series information
    if (typeof dataSeries === "object") {
      if (
        Array.isArray(dataSeries) &&
        Object.keys(dataSeries[0]).length === 0
      ) {
        return true;
      }

      return false;
    } else {
      return true;
    }
  };

  getSeries = function () {
    const series = localStorage.getItem(this._key) || "{}";

    return JSON.parse(series);
  };

  setSeries = function (newSeries) {
    const now = Date.now();
    const series = JSON.stringify({
      time: now,
      data_series: newSeries,
    });

    localStorage.setItem(this._key, series);
  };

  removeSeries = function () {
    localStorage.removeItem(this._key);
  };

  shouldUpdateStorage = function (oldTimestamp, newTimestamp, dataSeries) {
    const byDate = this._verifyDate(oldTimestamp, newTimestamp);
    const byDataSeries = this._verifyDataSeries(dataSeries);

    if (!byDate && !byDataSeries) {
      return false;
    }

    return true;
  };

  setMinimumGap(minimumGap) {
    this._minimumGap = minimumGap;
  }
}

const storage = new Series();
const now = Date.now();
const chart = createChart(container, {
  width: container.clientWidth,
  height: container.clientHeight,
});
const lineSeries = chart.addLineSeries({
  color: "gold",
});

let commodity = "corn";

window.addEventListener("DOMContentLoaded", () => {
  let { time, data_series } = storage.getSeries();

  if (!time) {
    time = 0;
  }

  if (storage.shouldUpdateStorage(time, now, data_series)) {
    getDataSeries().then((series) => {
      storage.setSeries(series);
      const bitcoinSeries = series.find(
        ({ commodity: tag }) => tag === "bitcoin"
      );
      const commoditySeries = series.find(
        ({ commodity: tag }) => tag === commodity
      );

      renderChart(bitcoinSeries, commoditySeries, lineSeries);
    });
  } else {
    const bitcoinSeries = data_series.find(
      ({ commodity }) => commodity === "bitcoin"
    );
    const commoditySeries = data_series.find(
      ({ commodity: tag }) => tag === commodity
    );

    renderChart(bitcoinSeries, commoditySeries, lineSeries);
  }
});

window.addEventListener("resize", () => {
  chart.resize(container.clientWidth, container.clientHeight);
});

async function getDataSeries() {
  const stream = await fetch("/api?commodity=all");
  return await stream.json();
}

function filterSeries({ data }) {
  const lineData = data.flatMap(([time, value]) => ({
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
    const bitcoinDate = String(bitcoinSeries[i].time);
    const commodityDate = String(commoditySeries[t].time);

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

function renderChart(bitcoinSeries, commoditySeries, lineSeries) {
  bitcoinSeries = filterSeries(bitcoinSeries);
  commoditySeries = filterSeries(commoditySeries);

  const normalizedSeries = normalizeDate(bitcoinSeries, commoditySeries);

  lineSeries.setData(normalizedSeries);
}
