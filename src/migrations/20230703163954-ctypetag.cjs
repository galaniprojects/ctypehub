'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CTypeTags', {
      CTypeId: {
        type: Sequelize.STRING,
        references: {
          model: 'CTypes',
          key: 'id',
        },
      },
      TagName: {
        type: Sequelize.STRING,
        references: {
          model: 'Tags',
          key: 'name',
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CTypeTags');
  },
};
