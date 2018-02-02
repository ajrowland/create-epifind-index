var args = require('system').args
var page = require('webpage').create()
var config = {
  username: args[1],
  password: args[2],
  indexname: args[3]
}

page.settings.loadImages = false

page.onLoadFinished = function(status) {
    console.log(page.url)
    console.log( (!phantom.state ? 'login-form-opened' : phantom.state) + ': ' + status )
    if(status === 'success') {
      if (!phantom.state) {
        page.evaluate(function(config) {
          var form = document.getElementsByTagName('form')[0]
          form.elements['UserName'].value = config.username
          form.elements['Password'].value = config.password
          form.submit()
        }, config)
        phantom.state = 'logged-in'
      } else if (phantom.state === 'logged-in') {
        page.open('https://find.episerver.com/MyServices')
        phantom.state = 'myservices-opened'
      } else if (phantom.state === 'myservices-opened') {
        var indexUrl = page.evaluate(function(config) {
          var indexes = document.getElementsByClassName('display-item')
          for (var i = 0; i < indexes.length; i++) {
            if (indexes[i].getElementsByTagName('h3')[0].innerText === config.indexname) {
              return indexes[i].getElementsByTagName('a')[0].href
            }
          }
          return ''
        }, config)
        if (indexUrl) {
          phantom.state = 'index-details'
          page.open(indexUrl)
        } else {
          phantom.state = 'index-form-opened'
          page.open('https://find.episerver.com/MyServices/AddFreeIndex')
        }
      } else if (phantom.state === 'index-form-opened') {
        page.evaluate(function(config) {
          var form = document.getElementsByTagName('form')[0]
          form.elements['Name'].value = config.indexname
          form.elements['Languages_English'].checked = true
          form.elements['TermsApproved'][0].checked = true
          form.submit()
        }, config);
        phantom.state = 'index-details'
      } else if (phantom.state === 'index-details') {
        var serviceUrl = page.evaluate(function() {
          return document.getElementsByClassName('display-field')[9].innerText.match(/http.+$/)[0]
        })
        console.log('<episerver.find serviceUrl="' + serviceUrl + '" defaultIndex="' + config.username + '_' + config.indexname +'"/>')
        phantom.exit()
      }
    }
}

page.open('https://find.episerver.com/Account/LogOn')