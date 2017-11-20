const dotenv = require('dotenv');
dotenv.config();

const MailListener = require("mail-listener2");
const stupid_db = require('./stupid_db');

const sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve,ms);
    });
};

module.exports.StartNew = (username, password, chatId, slack_emitter) => {
    let mailListener = new MailListener({
        username: username,
        password: password,
        host: "imap.yandex.ru",
        port: 993, // imap port
        tls: true,
        connTimeout: 10000, // Default by node-imap
        authTimeout: 5000, // Default by node-imap,
        debug: null,//console.log, // Or your custom function with only one incoming argument. Default: null
        tlsOptions: { rejectUnauthorized: false },
        mailbox: "INBOX", // mailbox to monitor
        searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
        markSeen: false, // all fetched email willbe marked as seen and not fetched next time
        fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
        mailParserOptions: {streamAttachments: false}, // options to be passed to mailParser lib.
        attachments: false, // download attachments as they are encountered to the project directory
        attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
    });

    mailListener.start(); // start listening

    mailListener.on("server:connected", function(){
        console.log("[IMAP]", username, "imapConnected");
    });

    mailListener.on("server:disconnected", function(){
        console.log("[IMAP]", username, "imapDisconnected");
    });

    mailListener.on("error", function(err){
        console.log("[IMAP]", err);
    });

    mailListener.on("mail", function(mail, seqno, attributes){
        console.log("[IMAP]", username, "- new mail,", seqno);
        //console.log(username, seqno, stupid_db.getLastRead(username), stupid_db.getLastRead(username) < seqno);
        if (stupid_db.getLastRead(username) < seqno) {
            slack_emitter.emit('IMAP_new_mail', mail, seqno, attributes, chatId);
            stupid_db.updateLastRead(username, seqno);
        }
    });

    mailListener.on("attachment", function(attachment){
        console.log(attachment.path);
    });
}

module.exports.testCredentials = async (username, password) => {
    let mailListener = new MailListener({
        username: username,
        password: password,
        host: "imap.yandex.ru",
        port: 993, // imap port
        tls: true,
        connTimeout: 10000, // Default by node-imap
        authTimeout: 5000, // Default by node-imap,
        debug: console.log, // Or your custom function with only one incoming argument. Default: null
        tlsOptions: { rejectUnauthorized: false },
        mailbox: "INBOX", // mailbox to monitor
        searchFilter: ["UNSEEN FLAGGED"], // the search filter being used after an IDLE notification has been retrieved
        markSeen: false, // all fetched email willbe marked as seen and not fetched next time
        fetchUnreadOnStart: false, // use it only if you want to get all unread email on lib start. Default is `false`,
        mailParserOptions: {streamAttachments: false}, // options to be passed to mailParser lib.
        attachments: false, // download attachments as they are encountered to the project directory
        attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
    });

    let results;

    await new Promise((resolve, reject) => {
        mailListener.start(); // start listening

        mailListener.once("server:connected", function(){
            console.log("[IMAP TEST]", username, "imapConnected");
            results = true;
            mailListener.stop();
            resolve();
        });

        mailListener.once("error", function(err){
            console.log("[IMAP TEST]", username, err);
            results = false;
            mailListener.stop();
            resolve();
        });
    });

    await sleep(2000);

    return results;
};
