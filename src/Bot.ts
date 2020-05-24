// Load environment variables.
import dotenv from 'dotenv';
// Load connection information.
import { Client } from 'discord.js';
import { connect } from 'mongoose';
// Logging
import logger from './services/logger';
import { GuildModel } from './models/Guild';
import GuildManager from './GuildManager';
import MessageHandler from './MessageHandler';

dotenv.config();

// Setup connection information.
const TOKEN = process.env.BOT_TOKEN;

// Create a new client.
const client = new Client();
const messageHandler = new MessageHandler();

client.on('guildCreate', async (guild) => {
    const guildSettings = await GuildModel.create({ id: guild.id });
    GuildManager.guilds.set(guild.id, guildSettings);
});

client.on('guildDelete', async (guild) => {
    GuildModel.deleteOne({ id: guild.id });
    GuildManager.guilds.delete(guild.id);
});

client.on('message', async (msg) => {
    if(msg.channel.type == 'dm') {
        messageHandler.handleDM(msg).catch(err => {
            logger.error(err);
        });
    }
    else if(msg.channel.type == 'text') {
        messageHandler.handleMessage(msg).catch(err => {
            logger.error(err);
        });
    }
});
(async () => {
    await connect(process.env.DB_CONNECTION_STRING);
    return client.login(TOKEN);
})().catch(err => {
    logger.error("Failed to log into Discord or MongoDB. Please check your .env file and compare it to .env.example.");
    logger.error(err);
    process.exit(1);
});