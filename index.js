'use strict'

const express     = require('express');
const bodyParser  = require('body-parser');
const request     = require('request');
const path        = require('path');
const app         = express();
const verifyToken = 'BwyrVv7wvZkaaPCPgMUeQKda';
const accessToken = 'EAAC5tNJLJv8BAIz1g1X1tiCqe81PnylHSm3uX11wVKcC0wFHQqXuvYvBO4Fvj5kJ8ZB5JB2PHpMp7S32ZAd9svPZA1nFxisOMlfYdIyfcpUGwGx3Cmfs39CTZCXDyHdZBG6Q8XkXZBCCslymwfquttr5YsLtfALKoeew0XX7tDwwZDZD';
const placeholder = require(path.join(__dirname, 'js/placeholder/placeholder.js'));

const emojis = [
  "😓",
  "😂",
  "😩",
  "😯",
  "😒",
  "🙄",
  "😱",
];
const autoReplies = [
  "Silly $protagonist…",
  "Another story!",
  "Shoot!",
  "Haha, good one.",
  "Really? $protagonist?",
  "No way!",
  "Tell me more.",
  "Keep 'em comin'!",
  "Lay another on me.",
  "Don't stop!",
  "More… MORE!",
  "Again!",
  "Any more?",
  "What happened next?",
  "And then?",
  "Oh $protagonist…",
  "Trust $protagonist!",
  "Sounds like $protagonist.",
  "Eer… I doubt it.",
];

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === verifyToken) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

app.post('/webhook', (request, response) => {
  let messaging_events = request.body.entry[0].messaging;
  for (let i = 0; i < messaging_events.length; i += 1) {
    let event = request.body.entry[0].messaging[i];
    let sender = event.sender.id;
    let attachment = event.message.attachments && event.message.attachments[0];
    if (attachment && attachment.type === 'image') {
      console.log(attachment.payload.url);
    }
    //let text = event.message.text;
    const thing = placeholder();
    sendTextMessage(sender, thing.phrase, thing.info);

    response.sendStatus(200);
  }
});

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});

function sendTextMessage(sender, text, replyInfo) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: accessToken },
    method: 'POST',
    json: {
      recipient: { id: sender, },
      message: {
        text,
        quick_replies: [
          {
            content_type: "text",
            title:        (Math.random() > 0.5 ? (emojis[Math.floor(Math.random() * emojis.length)] + ' ') : '') +
                            autoReplies[Math.floor(Math.random() * autoReplies.length)]
                            .replace('$protagonist', replyInfo.protagonist),
            payload:      "ANOTHER_STORY",
          },
        ],
      },
    },
  }, (error, response, body) => {
    if (error) {
      console.log('Error sending message: ', error);
    } else {
      console.log('Error: ', response.body.error);
    }
  });
}
