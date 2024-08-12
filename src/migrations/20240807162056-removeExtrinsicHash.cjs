'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('CTypes', 'extrinsicHash');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('CTypes', 'extrinsicHash', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
