'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    sequelize.define(
      'Tag',
      {
        cTypeId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        tagName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      { indexes: [{ fields: ['cTypeId'] }] },
    );

    await sequelize.sync();
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Tags');
  },
};
