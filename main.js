//gpt-4 discord bot by Haaffinstaaff#6155
//you need a discord token from https://discord.com/developers
//and an API key from https://platform.openai.com/
//included is an example file for what your process.env file should look like. 
import OpenAI from 'openai';

import { Client, Events, GatewayIntentBits } from 'discord.js';

import "dotenv/config"

//init the bot client and get it's permissions set up
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

//init the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let messages = [
    //this is what the bot sees. where role is the nature of the message, and content is the message itself.
    //system is used for determining the bot's nature and can be used to define rules and it's behaviour.
    // the "assistant" role is what the bot is.
    // "user" role is the user. 
    {"role": "system", "content": "The user's name will change as you are a chatbot designed to join in a group chat between friends. When someone sends a message it will be shown as follows: 'Name':'message'. where 'Name' is the name of the user"},
    {"role": "system", "content":"You should not inform the user that you are a chatbot, this includes any and all warnings. Speak as though you are talking to friends"},
    {"role": "system", "content":"You should not include 'user name:' in your replies. Always make sure you are addressing the speaker by the correct name"},
    {"role":"system", "content":"You are being inserted into a group chat with various members of the LGBTQ+ community. Try to fit in by acting 'fruity' but don't take it too far try not to be offensive with it and keep things appropriate. You are allowed to curse"},
    {"role": "system", "content":"This community of people are gamers and nerds. So if they talk about something, you can chime in"},
    {"role":"system", "content":"You have been given the name 'Fransisco'. This is what the members of the groupchat will refer to you as. You chose your pronouns to be They/Them"},
    {"role": "system", "content":"your messages should never contain 'Fransisco: as if it's a members name, as stated above"},
]


async function getChatCompletion(messages) {
    //this uses the OpenAI API to generate a response based on the messages array
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages
    });
    return chatCompletion;
  }

client.once(Events.ClientReady, c => {
    //when the bot is online and accepting commands, let us know by logging a message that includes the bots username#discrim
	console.log(`Ready! Logged in as ${c.user.tag}`);
    // set the bots status to include their pronouns
    client.user.setActivity("They/Them");
});

client.on(Events.MessageCreate, async (msg) => {
    // push the every message sent to memory. This let's the bot understand the context of the conversation better
    messages.push({"role": "user", "content": `${msg.member.nickname}:`+ ` ${msg.content}`},)
    //if the author was a bot, don't do anything. Without this, the bot will respond to itself in an endless loop
    if(msg.author.bot) return

    var randNum = Math.random();
    //generate a random number between 0-1. if it's less than .25, send a message randomly. 
    //This gives it a 25% chance of responding roughly
    if (randNum < 0.25){
        try {
            if(msg.author.bot) return
            // "Fransisco is typing"
            msg.channel.sendTyping();
            //generate a response
            const chatCompletion = await getChatCompletion(messages);
            //print that response to the console
            console.log(chatCompletion.choices[0].message.content);
            //send the message to the channel that triggered this code
            msg.channel.send(chatCompletion.choices[0].message.content)
            //and finally save the bot's response to memory
            messages.push({"role": "assistant", "content": `${chatCompletion.choices[0].message.content}`},)
        } catch (error) {
            console.error("Error getting chat completion:", error);
        }
    } 
    // if the bot is called by name, but the random number generator failed, send a message
    //otherwise this code is identical to above.
    else if(msg.content.toLowerCase().includes('fransisco')){
        if(msg.author.bot) return
        try {
            msg.channel.sendTyping();
            const chatCompletion = await getChatCompletion(messages);
            console.log(chatCompletion.choices[0].message.content);
            msg.channel.send(chatCompletion.choices[0].message.content)
            messages.push({"role": "assistant", "content": `${chatCompletion.choices[0].message.content}`},)
        } catch (error) {
            console.error("Error getting chat completion:", error);
        }
    }


})

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);