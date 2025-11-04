import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface CallSessionAttributes {
  id: string;
  userId: string;
  sessionId: string;
  phoneNumber: string;
  language: 'en' | 'sw' | 'luo' | 'ki';
  status: 'active' | 'completed' | 'failed';
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  summary?: string;
  smsSent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CallSessionCreationAttributes extends Optional<CallSessionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CallSession extends Model<CallSessionAttributes, CallSessionCreationAttributes> implements CallSessionAttributes {
  public id!: string;
  public userId!: string;
  public sessionId!: string;
  public phoneNumber!: string;
  public language!: 'en' | 'sw' | 'luo' | 'ki';
  public status!: 'active' | 'completed' | 'failed';
  public startedAt!: Date;
  public endedAt?: Date;
  public duration?: number;
  public summary?: string;
  public smsSent!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CallSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language: {
      type: DataTypes.ENUM('en', 'sw', 'luo', 'ki'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'active',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    smsSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'call_sessions',
    timestamps: true,
  }
);

CallSession.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CallSession, { foreignKey: 'userId' });

export default CallSession;
