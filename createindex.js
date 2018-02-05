const puppeteer = require('puppeteer')
const config = {
  username: process.argv[2],
  password: process.argv[3],
  indexname: process.argv[4]
}

console.time('start');

(async () => {
  const browser = await puppeteer.launch({headless: true}) // Debug with: {headless: false, devtools: true}
  const page = await browser.newPage()

  process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
    browser.close()
  })

  // Login
  await page.goto('https://find.episerver.com/Account/LogOn')
  await page.type('#UserName', config.username)
  await page.type('#Password', config.password)
  await page.$eval('form', form => form.submit())
  await page.waitForSelector('.find_header')

  // My services
  await page.goto('https://find.episerver.com/MyServices')
  
  let indexUrl = await page.evaluate(config => {
    let indexes = document.querySelectorAll('.display-item');
    if (indexes) {
      for (var index of indexes) {
        if (index.getElementsByTagName('h3')[0].innerText === config.indexname) {
          return index.getElementsByTagName('a')[0].href
        }
      }
    }
    return ''
  }, config)

  if (indexUrl) {
    // Open index details
    await page.goto(indexUrl)
  } else {
    // Create index
    await page.goto('https://find.episerver.com/MyServices/AddFreeIndex')
    await page.type('#Name', config.indexname)
    await page.click('#Languages_English')
    await page.click('#TermsApproved')
    await page.$eval('form', form => form.submit())
    await page.waitForSelector('#display-form')
  }

  // Output index configuration
  const serviceUrl = await page.$$eval('.display-field', items => items[9].innerText.match(/http.+$/)[0])

  console.log(`<episerver.find serviceUrl="${serviceUrl}" defaultIndex="${config.username}_${config.indexname}" />`)

  await browser.close()
})()