import {DMChannel, Message, MessageEmbed, NewsChannel, TextChannel} from "discord.js";
import {GuildSettings} from "../models/Guild";
import {User} from "../models/User";
const pkg = require("../../package.json");

export interface Contexts {
    text: boolean;
    dm: boolean;
}

export default class Command {
    public readonly name: string;
    public readonly requiredPermissions?: string[];
    public readonly aliases?: string[];
    public readonly contexts?: Contexts;
    public readonly execute : Function;
    public readonly managerOnly: boolean;

    static buildEmbed(command: Command, user?: User) : MessageEmbed {
        const embed = new MessageEmbed();
        embed.setTitle(`${command.name}`);
        embed.setColor("#5E81AC");
        if(command.managerOnly) {
            embed.setColor("#A3BE8C")
        }
        if(user && user.admin) {
            embed.setColor("#EBCB8B")
            embed.setFooter(`Conman v${pkg.version}\nProcessed at ${new Date().toISOString()}`);
        }
        return embed;
    }

    static async showErrorEmbed(command: Command | string, channel: TextChannel | DMChannel | NewsChannel, error: string) {
        const embed = new MessageEmbed();
        if(command instanceof Command) {
            embed.setTitle(`${command.name} | Error`);
        }
        else {
            embed.setTitle(`Error`);
        }
        embed.setColor('#BF616A');
        embed.setFooter(`Conman v${pkg.version}\nProcessed At: ${new Date().toISOString()}`);
        embed.setDescription(error);
        // embed.addField('Timestamp', new Date().toISOString());
        await channel.send(embed);
    }

    constructor(partial: Partial<Command>) {
        Object.assign(this, partial);
    }
}