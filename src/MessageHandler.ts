import {Collection, Message, MessageEmbed} from "discord.js";
import Command from './commands/Command';
import fs from "fs";
import logger from "./services/logger";
import  { GuildSettings, GuildModel } from "./models/Guild";
import GuildManager from "./GuildManager";
import  { User, UserModel } from "./models/User";


interface MessageData {
    content: string,
    parts: string[],
    cmd: string,
    args: string[],
    guildSettings?: GuildSettings
}

export default class MessageHandler {
    private commands: Collection<string, Command>;
    constructor() {
        this.commands = new Collection<string, Command>();
        logger.info('Loading Commands:');
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.command.js'));

        for(const file of commandFiles) {
            const command = new Command(require(`./commands/${file}`));

            logger.info(` - "${command.name}" loaded!`);
            if(command.aliases) {
                for(const alias of command.aliases) {
                    this.commands.set(alias, command);
                }
            }
            this.commands.set(command.name.toLowerCase(), command);
        }
    }

    async handleGeneralMessage(msg : Message, guildSettings? : GuildSettings) : Promise<MessageData> {
        const content = msg.content.substr(guildSettings ? guildSettings.prefix.length : 1);
        const parts = content.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        return {
            content, parts, cmd, args, guildSettings,
        };
    };

    async getOrMakeSettings(msg: Message) {
        let guildSettings;
        if(GuildManager.guilds.has(msg.guild.id)) {
            guildSettings = GuildManager.guilds.get(msg.guild.id);
        }
        else {
            guildSettings = await GuildModel.findOne({ snowflake: msg.guild.id });
            if(guildSettings === undefined || guildSettings === null) {
                logger.warn(`Found message in unknown guild ${msg.guild.name} (${msg.guild.id}). Creating guild data.`);
                guildSettings = await GuildModel.create({ snowflake: msg.guild.id });
            }
            GuildManager.guilds.set(msg.guild.id, guildSettings);
        }
        return guildSettings;
    }

    async handleMessage(msg : Message) {
        if(msg.author.bot) {
            return;
        }
        let guildSettings = await this.getOrMakeSettings(msg);
        if(!msg.content.startsWith(guildSettings.prefix)) {
            return;
        }
        const messageData = await this.handleGeneralMessage(msg, guildSettings);
        await this.handleCommand(msg, messageData);
    };

    async handleDM(msg: Message) {
        if(msg.author.bot) {
            return;
        }
        const messageData = await this.handleGeneralMessage(msg);
        await this.handleCommand(msg, messageData);
    };

    async handleCommand(msg : Message, messageData? : MessageData) {
        const { cmd, args, guildSettings } = messageData;
        if(!this.commands.has(cmd)) {
            if(guildSettings && !guildSettings.config.showInvalidCommand) {
                return;
            }
            logger.silly(`Invalid command ${cmd}.`);
            await Command.showErrorEmbed(cmd, msg.channel, `Invalid command \`${cmd}\`.`);
            return;
        }
        if(msg.channel.type !== "dm" && msg.channel.type !== "text") {
            return;
        }
        const command = this.commands.get(cmd.toLowerCase());
        if(!(msg.channel.type === "dm" && command.contexts.dm) && !(msg.channel.type === "text" && command.contexts.text)) {
            logger.silly(`Invalid context for command ${cmd} for ${msg.author.id}`);
            if(guildSettings && !guildSettings.config.showInvalidCommand) {
                return;
            }
            await Command.showErrorEmbed(command, msg.channel, `You can't use that here (${msg.channel.type} | ${command.contexts.text} | ${command.contexts.dm}).`);
            return;
        }
        // @ts-ignore
        if(command.requiredPermissions && !msg.member.hasPermission(command.requiredPermissions)) {
            logger.silly(`No permissions to use command ${cmd} for ${msg.author.id}`);
            if(guildSettings && !guildSettings.config.showInvalidCommand) {
                return;
            }
            await Command.showErrorEmbed(command, msg.channel, 'You don\'t have permission to use that here.');
            return;
        }
        if(command.managerOnly && msg.channel.type === "text") {
            const isManager = !msg.member.roles.cache.some(role => guildSettings.managerRoles.some(managerRole => managerRole === role.id));
            if(!isManager && !msg.member.permissions.has("MANAGE_GUILD") || !msg.member.permissions.has("ADMINISTRATOR")) {
                await Command.showErrorEmbed(command, msg.channel, 'You don\'t have permission to use that here.');
                return;
            }
        }
        let user = await UserModel.findOne({ snowflake: msg.author.id });
        if(!user) {
            user = await UserModel.create({ snowflake: msg.author.id });
        }
        try {
            await command.execute(msg, args, guildSettings, user);
        }
        catch (error) {
            logger.error(error);
            const errorEmbed = new MessageEmbed();
            errorEmbed.setTitle(`${command.name} | Critical Error`);
            errorEmbed.setColor('#FF0000');
            errorEmbed.setDescription(error);
            errorEmbed.setFooter('Please report this to the author.');
            errorEmbed.setFooter(`Processed At: ${new Date().toISOString()}`);
            await msg.channel.send(errorEmbed);
        }
    };
}