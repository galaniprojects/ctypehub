'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    sequelize.define('CType', {
      $id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      $schema: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      properties: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
    });

    sequelize.define('LastBlockScanned', {
      value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });

    await sequelize.sync();
  },
};
