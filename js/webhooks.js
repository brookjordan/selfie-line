const path    = require('path');
const app     = require(path.join(__dirname, '../js/app.js'));

module.exports = app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'EAAC5tNJLJv8BAJVBRg3uYzdK0ZC4HcxaWaCLHvJKoVc69qAIXIB4dXWdAxZA57Ef3thglRIvPgZCEyM8rPSlMuoa4ctBVRVOD7aT2KP4qHL9ZBV6x8Jr1Dv72pLOKDEvBpNzylBKAZBf03eZBdttEG6NwaIbIAeuQfmBcgm09kgQZDZD') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});
