import { model, Schema, Document } from 'mongoose';

export interface GuildConfig {
    showInvalidCommand: boolean,
}

export interface GuildSettings extends Document {
    snowflake: string;
    prefix: string;
    managerRoles: string[];
    logChannel?: string;
    using?: Schema.Types.ObjectId[];
    config: GuildConfig;
}

const GuildSchema = new Schema({
    snowflake: {
        type: String,
        unique: true,
        index: true,
    },
    managerRoles: [{
       type: String,
    }],
    prefix: {
        type: String,
        default: process.env.DEFAULT_PREFIX,
    },
    logChannel: {
        type: String,
    },
    using: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Namespace',
        },
    ],
    config: {
        showInvalidCommand: {
            type: Boolean,
            default: true,
        },
    },
}, {
    timestamps: true
});

export const GuildModel = model<GuildSettings>('Guild', GuildSchema);