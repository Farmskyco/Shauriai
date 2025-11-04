import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: string;
  phoneNumber: string;
  preferredLanguage: 'en' | 'sw' | 'luo' | 'ki';
  location?: string;
  county?: string;
  subcounty?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public phoneNumber!: string;
  public preferredLanguage!: 'en' | 'sw' | 'luo' | 'ki';
  public location?: string;
  public county?: string;
  public subcounty?: string;
  public name?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^\+254[0-9]{9}$/,
      },
    },
    preferredLanguage: {
      type: DataTypes.ENUM('en', 'sw', 'luo', 'ki'),
      allowNull: false,
      defaultValue: 'sw',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    county: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subcounty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
