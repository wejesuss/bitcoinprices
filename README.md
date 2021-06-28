<h1 align="center" style="color: #e2c31e">Bitcoin Prices</h1>

<h3 align="center">
  <a href="#information_source-about" style="color: #0b7596">About</a>&nbsp;|
  <a href="#interrobang-reason" style="color: #0b7596">Reason</a>&nbsp;|
  <a href="#seedling-requirements" style="color: #0b7596">Requirements</a>&nbsp;|
  <a href="#grey_question-getting-started" style="color: #0b7596">Getting Started</a>&nbsp;|
  <a href="#rocket-used-technologies" style="color: #0b7596">Technologies</a>
</h3>

---

<h2 style="color: #fefefe">:information_source: About</h2>

See the most traded commodities priced in Bitcoin (BTC).

<br/>

<h2 style="color: #fefefe">:interrobang: Reason</h2>

The reason is to create a long-term view of both scenarios (Fiat or Crypto) and how **deflationary** Bitcoin is.

<br/>

<h2 style="color: #fefefe">:seedling: Requirements</h2>

To run this project, you will need:

- <a href="https://nodejs.org/" style="color: #f6f6f6">NodeJs</a>
- <a href="https://www.npmjs.com/" style="color: #f6f6f6">Npm</a>
- <a href="https://vercel.com/" style="color: #f6f6f6">Vercel Account</a>
- <a href="https://docs.quandl.com/" style="color: #f6f6f6">Quandl API Key</a>

<br/>

<h2 style="color: #fefefe">:grey_question: Getting Started</h2>

You can access the <a href="https://bitcoinprices.vercel.app" style="color: #fefefe">website</a> or **preview/build** this project yourself.

First, make sure you have everything installed and you have the API Key from Quandl.

1. Add your new API Key to your environment variables and name it **QUANDL_API_KEY**

2. Clone this repository

```bash
git clone https://github.com/wejesuss/bitcoinprices.git && cd bitcoinprices
```

3. Install the dependencies

```bash
npm install
```

4. Set up a new Vercel project

```bash
npm start
```

Vercel CLI will guide you to create the new project. After that, you need to create a new environment variable for your next deployments.

Read more about this [here](https://vercel.com/docs/environment-variables)

<br/>

Now you can run the project locally or deploy it at anytime (preview or production)

To run the server locally (development):

```bash
npm run server
```

You should be able to see the following message:
<i>"Available at http://localhost:3000
"</i>

To deploy to preview:

```bash
npm start
```

To deploy to production:

```bash
npm run prod
```

<small>I recommend deleting older deployments after setup steps</small>

<br/>

<h2 style="color: #fefefe">:rocket: Used Technologies</h2>

This project was created with the following technologies

- HTML
- [CSS](https://sass-lang.com/) (SASS)
- JavaScript
- [Request](https://github.com/request/request#readme) (npm package)
