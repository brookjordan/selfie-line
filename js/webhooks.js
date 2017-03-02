let path = require('path');
let app  = require(path.join(__dirname, '../js/app.js'));

module.exports = {
  get: app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === 'EAAC5tNJLJv8BACXvdVU4H0LQkLvtqDFIBf3XkFaU6pc8vx0cV0eCogcuRWI4G8RSkjWwB9OANMOoA0R8QtIEMqKQZCEI8VZBeqpvDevtFC8IJMhAJCJh2JKnIm3d7j2T10Sp4en4Ofyih1hFPJbDlalsCiPDq7nelxnF7pWAZDZD') {
      console.log("Validating webhook");
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error("Failed validation. Make sure the validation tokens match.");
      console.error(`Recieved: ${req.query['hub.verify_token']}`);
      res.sendStatus(403);
    }
  }),

  post: app.post('/webhook', function (req, res) {
    let data = req.body;

    // Make sure this is a page subscription
    if (data && data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        let pageID = entry.id;
        let timeOfEvent = entry.time;

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.message) {
            receivedMessage(event);
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend.
      res.sendStatus(200);
    } else {
      console.log("Request is weird: ", JSON.stringify(req));
      console.log("Data doesn't work: ", data);
      res.sendStatus(400);
    }
  }),
};

function receivedMessage(event) {
  let senderID = event.sender.id;
  let recipientID = event.recipient.id;
  let timeOfMessage = event.timestamp;
  let message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  let messageId = message.mid;

  let messageText = message.text;
  let messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId, messageText) {
  // To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let recipientId = body.recipient_id;
      let messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}
