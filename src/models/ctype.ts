import type { ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model, Sequelize } from 'sequelize';

export default class CType extends Model {
  declare $id: ICType['$id'];
  declare $schema: ICType['$schema'];
  declare title: ICType['title'];
  declare properties: ICType['properties'];
  declare type: ICType['type'];
  declare description: string;

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
        createdAt: {
          type: DataTypes.DATE,
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
