import { readFileSync } from "fs";
import { resolve } from "path";
import request from "request";
import { promisify } from "util";

const meta = readFileSync(resolve(__dirname, "..", "./meta.json"), "utf8");
const { endpoints, commodities } = JSON.parse(meta);
const fetch = promisify(request);

module.exports = async (req, res) => {
  let { commodity } = req.query;

  if (Array.isArray(commodity)) {
    commodity = String(commodity[0]);
  } else {
    commodity = commodity || "corn";
  }

  const fillkey = `&api_key=${process.env.QUANDL_API_KEY}`;

  if (commodity === "all") {
    const commodities = await getAllSeriesData(fillkey);
    const series = commodities.map(({ commodity: name, dataset_data }) => ({
      commodity: name,
      ...removeEmpty(dataset_data),
    }));

    return res.send(series);
  } else if (commodities.includes(commodity)) {
    const seriesURL = `${endpoints[commodity]}${fillkey}`;

    const series = await getSeriesData(seriesURL);
    return res.send(removeEmpty(series["dataset_data"]));
  }

  return res.status(400).json({ error: "Invalid commodity tag" });
};

async function getAllSeriesData(fillkey) {
  const allSeries = [];

  for (let index = 0; index < commodities.length; index++) {
    const commodity = commodities[index];
    const seriesURL = `${endpoints[commodity]}${fillkey}`;
    const series = await getSeriesData(seriesURL);

    allSeries.push({
      commodity,
      ...series,
    });
  }

  return allSeries;
}

async function getSeriesData(seriesURL) {
  try {
    const response = await fetch({
      uri: seriesURL,
      json: true,
    });

    return response.body;
  } catch (error) {
    console.error(error);
  }
}

function removeEmpty(object) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([_, value]) => value !== null && value !== undefined
    )
  );
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
