import Command from "./Command";
import {Message} from "discord.js";
import {GuildSettings} from "../models/Guild";
import {User} from "../models/User";
import {commaListsAnd} from "common-tags";
import logger from "../services/logger";

module.exports = {
    name: 'Managers',
    contexts: {
        text: true,
    },
    managerOnly: true,
    async execute(msg: Message, args: string[], guildSettings: GuildSettings, user: User) {
        if(args.length < 2) {
            await Command.showErrorEmbed(this, msg.channel, "Invalid option. Valid choices are `add` and `remove`, each with a role parameter.");
            return;
        }
        else {
            let roleMatches : string[] = [];
            let re = /<@&(\d+)>/g;
            let joinedArgs = args.join(' ');
            let match;
            while((match = re.exec(joinedArgs)) != null) {
                roleMatches.push(match[1]);
            }
            if(roleMatches.length <= 0) {
                await Command.showErrorEmbed(this, msg.channel, "No valid roles found.");
                return;
            }
            const changedRoles = [];
            const embed = Command.buildEmbed(this, user);
            if(args[0] === "add") {
                for(let match of roleMatches) {
                    if(!guildSettings.managerRoles.includes(match)) {
                        guildSettings.managerRoles.push(match);
                        changedRoles.push(`<@&${match}>`);
                    }
                }
                embed.setDescription(commaListsAnd`Successfully added manager access to ${changedRoles}.`);
            }
            else if(args[0] === "remove") {
                for(let match of roleMatches) {
                    if (guildSettings.managerRoles.includes(match)) {
                        guildSettings.managerRoles = guildSettings.managerRoles.filter(it => it != match);
                        changedRoles.push(`<@&${match}>`);
                    }
                }
                embed.setDescription(commaListsAnd`Successfully removed manager access from ${changedRoles}.`);
            }
            await guildSettings.save();
            if(changedRoles.length > 0) {
                await msg.channel.send(embed);
            }
        }
    },
};