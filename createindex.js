const puppeteer = require('puppeteer');

(async () => {
  const config = {
    username: process.argv[2],
    password: process.argv[3],
    indexname: process.argv[4]
  }
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()

  // Login
  await page.goto('https://find.episerver.com/Account/LogOn')
  await page.type('#UserName', config.username)
  await page.type('#Password', config.password)
  await page.$eval('form', form => form.submit())
  await page.waitForNavigation()

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
    await page.goto(indexUrl)
  } else {
    // Create index
    await page.goto('https://find.episerver.com/MyServices/AddFreeIndex')
    await page.type('#Name', config.indexname)
    await page.click('#Languages_English')
    await page.click('#TermsApproved')
    await page.$eval('form', form => form.submit())
    await page.waitForNavigation()
  }

  // Index details
  let serviceUrl = await page.$$eval('.display-field', items => items[9].innerText.match(/http.+$/)[0])

  console.log(`<episerver.find serviceUrl="${serviceUrl}" defaultIndex="${config.username}_${config.indexname}" />`)

  await browser.close()
})()