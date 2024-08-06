'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('Tags', {
      type: 'foreign key',
      name: 'Tags_cTypeId_fkey',
      fields: ['cTypeId'],
      references: { table: 'CTypes', field: 'id' },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Tags', 'Tags_cTypeId_fkey');
  },
};
