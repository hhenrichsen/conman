import Command from "./Command";
import { Message } from "discord.js";
import { GuildSettings } from "../models/Guild";
import { User } from "../models/User";
const pkg = require("../../package.json")

module.exports = {
    name:"Conman",
    contexts: {
        dm: true,
        text: true
    },
    async execute(msg: Message, args: string[], guildConfig: GuildSettings, user: User) {
        let embed = Command.buildEmbed(this, user);
        embed.setDescription("Hello! I'm Conman. I help you to manage content on your server.");
        embed.addField("Version", pkg.version);
        embed.addField("Author", "UberPilot#9999");
        embed.addField("Support Discord", "https://discord.gg/UQvY6Vz");
        await msg.channel.send(embed);
    }
}