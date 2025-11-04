import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import CallSession from './CallSession';

interface ConversationAttributes {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  createdAt?: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'createdAt'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: string;
  public sessionId!: string;
  public role!: 'user' | 'assistant' | 'system';
  public content!: string;
  public audioUrl?: string;
  public timestamp!: Date;
  public readonly createdAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'call_sessions',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: true,
    updatedAt: false,
  }
);

Conversation.belongsTo(CallSession, { foreignKey: 'sessionId' });
CallSession.hasMany(Conversation, { foreignKey: 'sessionId' });

export default Conversation;
