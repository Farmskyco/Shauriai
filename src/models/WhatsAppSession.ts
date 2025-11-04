import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface WhatsAppSessionAttributes {
  id: string;
  userId: string;
  phoneNumber: string;
  language: 'en' | 'sw' | 'luo' | 'ki';
  state: 'initial' | 'main_menu' | 'disease_detection' | 'awaiting_image' | 'analyzing' | 'checkout' | 'ended';
  context: any;
  lastActivityAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WhatsAppSessionCreationAttributes extends Optional<WhatsAppSessionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class WhatsAppSession extends Model<WhatsAppSessionAttributes, WhatsAppSessionCreationAttributes> implements WhatsAppSessionAttributes {
  public id!: string;
  public userId!: string;
  public phoneNumber!: string;
  public language!: 'en' | 'sw' | 'luo' | 'ki';
  public state!: 'initial' | 'main_menu' | 'disease_detection' | 'awaiting_image' | 'analyzing' | 'checkout' | 'ended';
  public context!: any;
  public lastActivityAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WhatsAppSession.init(
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
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language: {
      type: DataTypes.ENUM('en', 'sw', 'luo', 'ki'),
      allowNull: false,
      defaultValue: 'sw',
    },
    state: {
      type: DataTypes.ENUM('initial', 'main_menu', 'disease_detection', 'awaiting_image', 'analyzing', 'checkout', 'ended'),
      allowNull: false,
      defaultValue: 'initial',
    },
    context: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'whatsapp_sessions',
    timestamps: true,
  }
);

WhatsAppSession.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(WhatsAppSession, { foreignKey: 'userId' });

export default WhatsAppSession;
