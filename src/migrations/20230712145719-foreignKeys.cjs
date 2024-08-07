'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('Attestations', {
      type: 'foreign key',
      name: 'Attestations_cTypeId_fkey',
      fields: ['cTypeId'],
      references: { table: 'CTypes', field: 'id' },
    });
    await queryInterface.addConstraint('Tags', {
      type: 'foreign key',
      name: 'Tags_cTypeId_fkey',
      fields: ['cTypeId'],
      references: { table: 'CTypes', field: 'id' },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'Attestations',
      'Attestations_cTypeId_fkey',
    );
    await queryInterface.removeConstraint('Attestations', 'Tags_cTypeId_fkey');
  },
};
