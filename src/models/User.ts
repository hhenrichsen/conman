import { Document, Schema, model } from 'mongoose';

export interface User extends Document {
    snowflake: string;
    admin: boolean;
    activeNamespace: Schema.Types.ObjectId;
    member: boolean;
}

const UserSchema = new Schema({
    snowflake: {
        type: String,
        unique: true,
        index: true,
    },
    admin: {
        type: Boolean,
        required: false,
        default: false,
    },
    activeNamespace: {
        type: Schema.Types.ObjectId,
        ref: 'Namespace',
        required: false,
    },
    currentContent: {
        type: Number,
        default: 0,
    },
    member: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

export const UserModel = model<User>('User', UserSchema);
export default UserModel;