import Command from "./Command";
import { Message } from "discord.js";
import { GuildSettings } from "../models/Guild";
import { User } from "../models/User";

module.exports = {
    name:"Ping",
    contexts: {
        dm: true,
        text: true
    },
    async execute(msg: Message, args: string[], guildConfig: GuildSettings, user: User) {
        let embed = Command.buildEmbed(this, user);
        embed.setDescription("Pong!");
        if(!embed.footer) {
            embed.setFooter(`Processed at ${new Date().toISOString()}`)
        }
        await msg.channel.send(embed);
    }
}