import { Document, Schema, model } from 'mongoose';
import { User } from './User';

export interface Namespace extends Document {
    name: string,
    snowflake: string,
    owner: User,
    members: User[]
}

const NamespaceSchema = new Schema({
    name: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    ]
}, {
    timestamps: true,
});

export const NamespaceModel = model<Namespace>('Namespace', NamespaceSchema);
export default NamespaceModel;