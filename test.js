
var dialogs = require('dialogs');

function confirmation() {
  dialogs.alert('okidoki', function(ok) {
  console.log('alert', ok)
  dialogs.confirm('ok?', function(ok) {
    console.log('confirm', ok)
    dialogs.prompt('username', 'joe.smith@gmail.com', function(ok) {
      console.log('prompt with default', ok)
      dialogs.prompt('username', function(ok) {
        console.log('prompt', ok)
      })
    })
  })
})
}