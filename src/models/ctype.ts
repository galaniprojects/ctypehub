import type { ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model, Sequelize } from 'sequelize';

interface CTypeData extends ICType {
  description: string;
}

export default class CType extends Model<CTypeData> {
  static initTable(sequelize: Sequelize): void {
    CType.init(
      {
        $id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        $schema: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        properties: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
        },
      },
      { sequelize },
    );
  }
}
