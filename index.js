const express = require('express');
const path    = require('path');
const app     = require(path.join(__dirname, 'js/app.js'));
const webhook = require(path.join(__dirname, 'js/webhooks.js'));

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
