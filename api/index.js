import { readFileSync } from "fs";
import { resolve } from "path";
import request from "request";
import { promisify } from "util";

const meta = readFileSync(resolve(__dirname, "..", "./meta.json"), "utf8");
const { endpoints, commodities } = JSON.parse(meta);
const fetch = promisify(request);

module.exports = async (req, res) => {
  let { commodity } = req.query;
  const protocol = req.headers["x-forwarded-proto"] || "https";

  if (Array.isArray(commodity)) {
    commodity = String(commodity[0]);
  } else {
    commodity = commodity || "corn";
  }

  const fillkey = `&api_key=${process.env.QUANDL_API_KEY}`;
  res.setHeader(
    "Access-Control-Allow-Origin",
    `${protocol}://${process.env.VERCEL_URL}`
  );

  if (commodity === "all") {
    const allSeries = await getAllSeriesData(fillkey);
    const series = allSeries.map(({ commodity: name, dataset_data }) => ({
      commodity: name,
      ...removeEmpty(dataset_data),
    }));

    res.setHeader("Cache-Control", "max-age=0, s-maxage=7200");
    return res.status(200).send(series);
  } else if (commodities.includes(commodity)) {
    const seriesURL = `${endpoints[commodity]}${fillkey}`;
    const series = await getSeriesData(seriesURL);

    res.setHeader("Cache-Control", "max-age=0, s-maxage=7200");
    return res.status(200).send(removeEmpty(series["dataset_data"]));
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
