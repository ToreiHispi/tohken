// Init Panel
chrome.devtools.inspectedWindow.eval('window.location.href', {}, function (result, exceptionInfo) {
  // Init
  if (result.indexOf('tohken') > -1) {
    // Create Panel
    chrome.devtools.panels.create(
      '~TRH~',
      null,
      '/app/panel/index.html',
      function (panel) {
        // Welcome
        chrome.runtime.sendMessage({
          type: 'notify',
          message: {
            title: 'Welcome to ~TRH~',
            message: 'Please find the "Touken Ranbu Helper" tab in the new Dev panel.',
            context: 'Build version：v1.2.2'
          }
        })
      }
    )
  }
})
