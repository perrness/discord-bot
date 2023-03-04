const { Client, Events, GatewayIntentBits } = require('discord.js');
const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const dotenv = require('dotenv');

dotenv.config();
const token = process.env.DISCORD_TOKEN;
const GENERAL_CHAT_ID = process.env.GENERAL_CHAT_ID;
const MUTED_CHAT_ID= process.env.MUTED_CHAT_ID;
const SERVER_OWNER_ID = process.env.SERVER_OWNER_ID;

const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'jeff-bot' },
  transports: [
    new winston.transports.Console(),
    loggingWinston
  ],
});

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
  logger.info(`Ready! Logged in as ${c.user.tag}`);
});
//
// Log in to Discord with your client's token
client.login(token);

client.on('ready', async () => {
  const channel = await client.channels.fetch(GENERAL_CHAT_ID);
  const message = await channel.messages.fetch({limit: 1});
  logger.info(message.first().content);
});

client.on('voiceStateUpdate', async (oldVoiceState, newVoiceState) => {
  if(newVoiceState.member.user.id === SERVER_OWNER_ID) {
    return;
  }

  if(oldVoiceState.mute !== newVoiceState.mute) {
    if(newVoiceState.mute) {
      const channel = await client.channels.fetch(GENERAL_CHAT_ID);
      const message = await channel.messages.fetch({limit: 1});
      if(message.first().content !== `${newVoiceState.member.user.username} muted themselves!` && !isWithinFiveMinutes(message.first().createdTimeStamp)) {
        await channel.send(`${newVoiceState.member.user.username} muted themselves!`)
      }
      newVoiceState.member.voice.setChannel(MUTED_CHAT_ID);
    }
  }
});

const isWithinFiveMinutes = (createdTime) => {
  var createdDate = new Date(createdTime * 1000);

  return (Date.now() - createdDate) <= (5 * 60 * 1000);
}
