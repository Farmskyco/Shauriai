import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface PlantAnalysisAttributes {
  id: string;
  userId: string;
  whatsappSessionId?: string;
  imageUrl: string;
  analysisResult: any;
  detectedDiseases: string[];
  detectedDeficiencies: string[];
  confidence: number;
  recommendations: string[];
  recommendedProducts: string[];
  status: 'pending' | 'completed' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlantAnalysisCreationAttributes extends Optional<PlantAnalysisAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PlantAnalysis extends Model<PlantAnalysisAttributes, PlantAnalysisCreationAttributes> implements PlantAnalysisAttributes {
  public id!: string;
  public userId!: string;
  public whatsappSessionId?: string;
  public imageUrl!: string;
  public analysisResult!: any;
  public detectedDiseases!: string[];
  public detectedDeficiencies!: string[];
  public confidence!: number;
  public recommendations!: string[];
  public recommendedProducts!: string[];
  public status!: 'pending' | 'completed' | 'failed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PlantAnalysis.init(
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
    whatsappSessionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    analysisResult: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    detectedDiseases: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    detectedDeficiencies: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    recommendations: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    recommendedProducts: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'plant_analyses',
    timestamps: true,
  }
);

PlantAnalysis.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PlantAnalysis, { foreignKey: 'userId' });

export default PlantAnalysis;
