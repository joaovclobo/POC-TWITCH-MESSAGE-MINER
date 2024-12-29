const tmi = require('tmi.js');
const dotenv = require('dotenv').config();
const fs = require('fs');
const path = require('path');


const BOT_NAME = process.env.BOT_NAME;
const TOKEN_BOT = process.env.TOKEN_BOT;
const CHANNELS = process.env.CHANNELS.split(',');
console.log('CHANNELS: ', CHANNELS);

const getSimpleFormattedDate = () => {
    return new Date().toLocaleDateString('pt-BR')
}

const getFormattedDateAndTime = () => {
    return new Date().toLocaleTimeString('pt-BR', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    })
}

const filePath = path.join(__dirname, `data_chats.json`)

let messageBuffer = [];

function appendMessagesToFile() {
    if (messageBuffer.length === 0) {
        return;
    }

    const newMessages = messageBuffer.map(msg => JSON.stringify(msg)).join(',\n') + ',\n';

    if (!fs.existsSync(filePath)) {
        fs.writeFile(filePath, '[\n' + newMessages, (err) => {
            if (err) {
                console.error('Erro ao criar o arquivo:', err);
            } else {
                console.log('Arquivo criado com sucesso!');
            }
        });
    } else {
        fs.appendFile(filePath, newMessages, (err) => {
            if (err) {
                console.error('Erro ao adicionar mensagens ao arquivo:', err);
            } else {
                console.log('Mensagens adicionadas ao arquivo com sucesso!', getFormattedDateAndTime());
            }
        });
    }

    messageBuffer = [];
}

function closeJSONFile() {
    fs.appendFile(filePath, ']', (err) => {
        if (err) {
            console.error('Erro ao fechar o JSON:', err);
        } else {
            console.log('Arquivo JSON fechado corretamente.');
        }
    });
}

setInterval(appendMessagesToFile, 60 * 1000);

process.on('exit', closeJSONFile);
process.on('SIGINT', () => {
    closeJSONFile();
    process.exit();
});


const options = {
    identity: {
        username: BOT_NAME,
        password: TOKEN_BOT
    },
    channels: CHANNELS
    
}

const client = new tmi.client(options);

function reciveMessage(target, context, message, self) {
    if (self) return;

    const messageData = {
        channel: target,
        user: context.username,
        message: message,
        timestamp: getFormattedDateAndTime(),
        'badge-info': context['badge-info'],
        badges: context.badges,
        'client-nonce': context['client-nonce'],
        'display-name': context['display-name'],
        emotes: context.emotes,
        'first-msg': context['first-msg'],
        flags: context.flags,
        id: context.id,
        mod: context.mod,
        'returning-chatter': context['returning-chatter'],
        'room-id': context['room-id'],
        subscriber: context.subscriber,
        turbo: context.turbo,
        'user-id': context['user-id'],
        'user-type': context['user-type'],
        vip: context.vip,
        'emotes-raw': context['emotes-raw'],
        'badges-raw': context['badges-raw'],
        username: context.username,
        'message-type': context['message-type']
    }
    
    messageBuffer.push(messageData);
}

console.log('Bot is running - reciving messages from: ', CHANNELS);
console.log('Saving messages to: ', filePath);

client.on('message', reciveMessage);
client.connect();
