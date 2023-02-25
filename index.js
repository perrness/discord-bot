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

client.on('ready', async () => {
  const channel = await client.channels.fetch(GENERAL_CHAT_ID);
  //channel.then(test => test.send("Hello"))
  const message = await channel.messages.fetch({limit: 1});
  console.log(message.first().content);
  //channel.then(test => console.log(test.messages.fetch({ limit: 2 })));
});

client.on('voiceStateUpdate', async (oldVoiceState, newVoiceState) => {
  if(oldVoiceState.selfMute !== newVoiceState.selfMute) {
    if(newVoiceState.selfMute) {
      const channel = await client.channels.fetch(GENERAL_CHAT_ID);
      const message = await channel.messages.fetch({limit: 1});
      if(message.first().content !== `${newVoiceState.member.user.username} muted themselves!` && !isWithinFiveMinutes(message.first().createdTimeStamp)) {
        await channel.send(`${newVoiceState.member.user.username} muted themselves!`)
      }
      //channel.send(`${newVoiceState.member.user.tag} muted themselves!`);
      //channels.then(channel => channel.send(`${newVoiceState.member.user.tag} muted themselves!`))
      newVoiceState.member.voice.setChannel(MUTED_CHAT_ID);
    }
  }
});

const isWithinFiveMinutes = (createdTime) => {
  var fiveMinutesAgo = (Date.now() / 1000) - (5 * 60);

  return createdTime >= fiveMinutesAgo;
}
