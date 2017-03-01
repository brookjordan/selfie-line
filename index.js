const express = require('express');
const path    = require('path');
const app     = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('<h1>Hi!</h1>');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
