require('dotenv').config();

const MailBox = require('./mailbox');
const db = require('./stupid_db');

let RtmClient = require('@slack/client').RtmClient;
let RTM_EVENTS = require('@slack/client').RTM_EVENTS;
let CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const token = process.env.SLACK_BOT_TOKEN || '';

let rtm = new RtmClient(token, { logLevel: 'info' });
rtm.start();

const validateMessage = (text) => {
    params = text.split(" ");
    if (params.length !== 3) return undefined;
    if (params[0] !== 'add_mail') return undefined;
    let t = /\|.*\>/g.exec(params[1])[0];
    params[1] = t.slice(1, t.length - 1);
    return params;
}

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    console.log('[SLACK] Connected');
    for(let i in db.data) {
        let user = db.data[i];
        MailBox.StartNew(user.username, user.password, rtm);
    }
});

rtm.on(RTM_EVENTS.MESSAGE, async function handleRtmMessage(message) {
    console.log('[SLACK] Message:', message);
    let data = validateMessage(message.text);
    if (data === undefined) {
        rtm.sendMessage('Bad use: _add_mail test@esnrussia.org password_', message.channel);
        return;
    }

    rtm.sendMessage("*Gotcha!*\nTesting your credentials...", message.channel);

    let credentials_test = await MailBox.testCredentials(params[1], params[2]);

    if (!credentials_test) {
        rtm.sendMessage("Something's wrong with your credentials :confused:\nCheck and try again", message.channel);
        return;
    }

    db.addMailBox(params[1], params[2], message.channel);
    MailBox.StartNew(params[1], params[2], rtm);
    rtm.sendMessage("*Yey!* :shipit:\n New mailbox added ", message.channel);
});

rtm.on('IMAP_new_mail', (mail, seqno, attributes) => {
    rtm.sendMessage(mail.subject + " " + mail.from[0].address + " " + mail.from[0].name, 'D82DN636V');
});
