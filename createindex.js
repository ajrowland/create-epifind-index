const args = require('minimist')(process.argv.slice(2))

if (!(args.username && args.password && args.indexname)) {
  console.log('Supply username/password/indexname arguments.')
  process.exit()
}

const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.launch({headless: true}) // Debug with: {headless: false, devtools: true}
  const page = await browser.newPage()

  process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
    browser.close()
  })

  // Login
  await page.goto('https://find.episerver.com/Account/LogOn')
  await page.type('#UserName', args.username)
  await page.type('#Password', args.password)
  await page.$eval('form', form => form.submit())
  await page.waitForSelector('.find_header')

  // My services
  await page.goto('https://find.episerver.com/MyServices')
  
  let index = await page.evaluate(args => {
    let indexes = document.querySelectorAll('.display-item');
    let url = ''
    if (indexes) {
      for (var index of indexes) {
        if (index.getElementsByTagName('h3')[0].innerText === args.indexname) {
          url = index.getElementsByTagName('a')[0].href
          break
        }
      }
    }
    return {url: url, total: indexes.length}
  }, args)

  if (index.url) {
    // Open index details
    await page.goto(index.url)
  } else {
    if (index.total === 5) {
      console.log('Cannot exceed 5 indexes.')
      process.exit()
    }

    // Create index
    await page.goto('https://find.episerver.com/MyServices/AddFreeIndex')
    await page.type('#Name', args.indexname)
    await page.click('#Languages_English')
    await page.click('#TermsApproved')
    await page.$eval('form', form => form.submit())
    await page.waitForSelector('#display-form')
  }

  // Output index configuration
  const serviceUrl = await page.$$eval('.display-field', items => items[9].innerText.match(/http.+$/)[0])

  console.log(`<episerver.find serviceUrl="${serviceUrl}" defaultIndex="${args.username}_${args.indexname}" />`)

  await browser.close()
})()