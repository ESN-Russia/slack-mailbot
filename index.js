require('dotenv').config();

var IncomingWebhook = require('@slack/client').IncomingWebhook;

var url = process.env.SLACK_WEBHOOK_URL || '';

var webhook = new IncomingWebhook(url);

webhook.send('Hello there', function(err, header, statusCode, body) {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Received', statusCode, 'from Slack');
  }
});
