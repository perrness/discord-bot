const dotenv = require('dotenv');
dotenv.config();

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const GENERAL_CHAT_ID = process.env.GENERAL_CHAT_ID;
const MUTED_CHAT_ID= process.env.MUTED_CHAT_ID;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});
//
// Log in to Discord with your client's token
client.login(token);

client.on('ready', () => {
  const channel = client.channels.fetch(GENERAL_CHAT_ID);
  //channel.then(test => test.send("Hello"))
  console.log(channel);
});

client.on('voiceStateUpdate', (oldVoiceState, newVoiceState) => {
  if(oldVoiceState.selfMute !== newVoiceState.selfMute) {
    if(newVoiceState.selfMute) {
      const channel = client.channels.fetch(GENERAL_CHAT_ID);
      //channel.send(`${newVoiceState.member.user.tag} muted themselves!`);
      //channels.then(channel => channel.send(`${newVoiceState.member.user.tag} muted themselves!`))
      console.log(`${newVoiceState.member.user.tag} muted themselves!`);
      newVoiceState.member.voice.setChannel(MUTED_CHAT_ID);
    }
  }
});
