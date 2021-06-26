const createChart = LightweightCharts.createChart;
const container = document.getElementById("c-main__chart");

const CHART_SPACE = 0.8;

const BITCOIN_UNITS = {
  decabitcoin: 0.1,
  bitcoin: 1,
  centibitcoin: 100,
  millibitcoin: 1000,
  microbitcoin: 1000000,
  satoshi: 100000000,
};

const CHART_RANGE = {
  "_3 months": 0,
  get "3 months"() {
    return this["_3 months"];
  },
  set "3 months"(date) {
    const today = new Date(date);
    this["_3 months"] = today.setMonth(today.getMonth() - 3, today.getDate());
  },

  "_6 months": 0,
  get "6 months"() {
    return this["_6 months"];
  },
  set "6 months"(date) {
    const today = new Date(date);
    this["_6 months"] = today.setMonth(today.getMonth() - 6, today.getDate());
  },

  _ytd: 0,
  get ytd() {
    return this["_ytd"];
  },
  set ytd(date) {
    const today = new Date(date);
    this["_ytd"] = today.setMonth(0, 1);
  },

  "_5 years": 0,
  get "5 years"() {
    return this["_5 years"];
  },
  set "5 years"(date) {
    const today = new Date(date);

    this["_5 years"] = today.setFullYear(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    );
  },

  _all: 0,
  get all() {
    return this["_all"];
  },
  set all(date) {
    this["_all"] = new Date(date).getTime();
  },
};

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
  height: container.clientHeight * CHART_SPACE,
});
const lineSeries = chart.addLineSeries({
  color: "gold",
});

let commodity = "corn";
let lang = "en";
let bitcoinUnit = 1000000;
let startDate = "";
let endDate = "";

window.addEventListener("DOMContentLoaded", () => {
  [lang, commodity] = getCommodityAndLang();

  let { time, data_series } = storage.getSeries();

  if (!time) {
    time = 0;
  }

  if (storage.shouldUpdateStorage(time, now, data_series)) {
    getDataSeries()
      .then((series) => {
        storage.setSeries(series);

        renderChart(series, lineSeries);
      })
      .catch((reason) => {
        console.error(reason);

        if (data_series) {
          renderChart(data_series, lineSeries);
        }
      });

    if (data_series) {
      renderChart(data_series, lineSeries);
    }
  } else {
    renderChart(data_series, lineSeries);
  }

  chart.applyOptions({
    localization: {
      locale: lang,
      priceFormatter: (price) => {
        return Intl.NumberFormat(lang, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(price);
      },
    },
  });

  chart.timeScale().subscribeVisibleTimeRangeChange(onVisibleTimeRangeChanged);
});

window.addEventListener("resize", () => {
  chart.resize(container.clientWidth, container.clientHeight * CHART_SPACE);
});

function getCommodityAndLang() {
  return location.pathname.split("/").filter((v) => v);
}

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
        value:
          (commoditySeries[t].value / bitcoinSeries[i].value) * bitcoinUnit,
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

function renderChart(data_series, lineSeries) {
  let bitcoinSeries = data_series.find(
    ({ commodity }) => commodity === "bitcoin"
  );
  let commoditySeries = data_series.find(
    ({ commodity: tag }) => tag === commodity
  );

  bitcoinSeries = filterSeries(bitcoinSeries);
  commoditySeries = filterSeries(commoditySeries);

  const normalizedSeries = normalizeDate(bitcoinSeries, commoditySeries);
  startDate = normalizedSeries[0].time;
  endDate = normalizedSeries[normalizedSeries.length - 1].time;

  setRange(startDate, endDate);

  lineSeries.setData(normalizedSeries);
}

function changeUnit(unitName) {
  const unit = getUnit(unitName) || 1000000;
  const { data_series } = storage.getSeries();

  if (data_series) {
    bitcoinUnit = unit;
    renderChart(data_series, lineSeries);
  }
}

function changeRange(dateRange = "All") {
  const range = getRange(dateRange);

  chart.timeScale().setVisibleRange({
    from: range / 1000,
    to: new Date(endDate).getTime() / 1000,
  });
}

function getUnit(unitName = "microBitcoin") {
  return BITCOIN_UNITS[unitName.toLowerCase()];
}

function getRange(dateRange = "All") {
  return CHART_RANGE[dateRange.toLowerCase()];
}

function setRange(startDate, endDate) {
  Object.keys(CHART_RANGE)
    .filter((range) => !range.includes("_"))
    .forEach((range) => {
      if (range === "all") {
        CHART_RANGE[range] = startDate;
      } else {
        CHART_RANGE[range] = endDate;
      }
    });
}
