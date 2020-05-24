import Command from "./Command";
import {Message} from "discord.js";
import {GuildSettings} from "../models/Guild";
import {User} from "../models/User";
import logger from "../services/logger";

module.exports = {
    name: 'Prefix',
    contexts: {
        text: true,
    },
    managerOnly: true,
    async execute(msg: Message, args: string[], guildSettings: GuildSettings, user: User) {
        if(args.length < 1) {
            let embed = Command.buildEmbed(this, user);
            embed.addField('Prefix', guildSettings.prefix);
            await msg.channel.send(embed);
        }
        else {
            guildSettings.prefix = args[0];
            let embed = Command.buildEmbed(this, user);
            embed.setDescription(`Set prefix to \`${args[0]}\``);
            await guildSettings.save();
            await msg.channel.send(embed);
            logger.info(`User ${msg.author.tag} (${msg.author.id}) set the prefix of ${msg.guild.name} (${guildSettings.id}) to '${args[0]}'.`);
        }
    },
};