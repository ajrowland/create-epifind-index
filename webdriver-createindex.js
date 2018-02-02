var phantomjs = require('phantomjs-prebuilt')
var webdriverio = require('webdriverio')
var wdOpts = { desiredCapabilities: { browserName: 'phantomjs' } }
var config = {
  'username': 'arowland',
  'password': 'adR2611!',
  'indexname': 'testindex2',
  'url': {
    'login': 'https://find.episerver.com/Account/LogOn',
    'createindex': 'https://find.episerver.com/MyServices/AddFreeIndex'
  },
  'element': {
    'username': '#UserName',
    'password': '#Password',
    'indexname': '#Name',
    'english': '#Languages_English',
    'terms': '#TermsApproved',
    'submit': 'input[type="submit"]',
  }
}

phantomjs.run('--webdriver=4444').then(program => {

  var browser = webdriverio
    .remote(wdOpts)
    .init()

  browser.addCommand('waitForTitle', function (title, timeout) {
    browser.waitUntil(function () {
        return browser.getTitle() === title;
    }, timeout | 5000, `Timeout waiting for page: ${title}`);
  });

  browser.url(config.url.login)
    // Log on page
    .waitForTitle('Log On')
    .getTitle().then(title => {
      console.log(title)
    })
    .setValue(config.element.username, config.username)
    .setValue(config.element.password, config.password)
    .click(config.element.submit)
    // Log on success
    .waitForTitle('Episerver Find')
    .url(config.url.createindex)
    // Create index page
    .getTitle().then(title => {
      console.log(title)
    })
    .waitForTitle('Create Developer Service')
    .getTitle().then(title => {
      console.log(title)
    })
    .setValue(config.element.indexname, config.indexname)
    .click(config.element.english)
    .click(config.element.terms)
    .click(config.element.submit)
    // Create index success
    .waitForTitle('Index Details')
    .getTitle().then(title => {
      console.log(title)
      program.kill()
    })
    .catch(function(err) {
        console.log(err)
    });
})
