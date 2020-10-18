const puppeteer = require('puppeteer');
const fs = require('fs')

const url = process.argv[2];
const fraze = process.argv[3];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const numberOfPages = (await page.evaluate(() => document.querySelector('span.totalcount').innerHTML)) / 120;
  for (let i=0; i<= Math.floor(numberOfPages); i++) {
    await page.waitForSelector('a[title="next page"]');
    await page.evaluate(() => {document.querySelector('a[title="next page"]').click()});
    await page.waitForTimeout(2000);
  }
  const iframeSrc = await page.evaluate(() => document.querySelector('iframe').src);
  await page.goto(iframeSrc);
  const results = JSON.parse((await page.evaluate(() => localStorage.getItem('resultSets'))));
  await browser.close();

  console.log();
  fs.writeFile('results', parseData(results).join('\n'), (err) => {
    if (err) return console.log(err);
  });
})();

const parseData = (results) => {
  const urlSet = new Set();
  Object.values(results).forEach(element => {
    element.urls.forEach(url => {
      urlSet.add(url);
    })
  })
  return Array
        .from(urlSet)
        .filter(url => url.includes(fraze));
}