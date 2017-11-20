const fs = require('fs');

let data = require('./stupid_db.json');

let usernames = {};
for (var i = 0; i < data.length; i++) {
    usernames[data[i].username] = i;
}

console.log(data);

module.exports;

module.exports.getLastRead = (username) => {
    return data[usernames[username]].lastRead;
}

module.exports.updateLastRead = (username, newId) => {
    data[usernames[username]].lastRead = newId;
    fs.writeFileSync('./stupid_db.json', JSON.stringify(data));
}

module.exports.addMailBox = (username, password, chatId) => {
    data[data.length] = {username: username, password: password, chatId: chatId, lastRead: 0};
    usernames[username] = data.length - 1;
    fs.writeFileSync('./stupid_db.json', JSON.stringify(data));
};

module.exports.data = data;
