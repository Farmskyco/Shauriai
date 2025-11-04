import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductAttributes {
  id: string;
  name: string;
  nameSwahili?: string;
  nameLuo?: string;
  nameKikuyu?: string;
  category: 'fertilizer' | 'pesticide' | 'seed' | 'equipment' | 'other';
  description: string;
  price: number;
  unit: string;
  stockQuantity: number;
  manufacturer?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: string;
  public name!: string;
  public nameSwahili?: string;
  public nameLuo?: string;
  public nameKikuyu?: string;
  public category!: 'fertilizer' | 'pesticide' | 'seed' | 'equipment' | 'other';
  public description!: string;
  public price!: number;
  public unit!: string;
  public stockQuantity!: number;
  public manufacturer?: string;
  public imageUrl?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nameSwahili: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nameLuo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nameKikuyu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('fertilizer', 'pesticide', 'seed', 'equipment', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
  }
);

export default Product;
