'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    sequelize.define('CType', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      schema: {
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
      block: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      creator: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
    });

    await sequelize.sync();
  },
};
