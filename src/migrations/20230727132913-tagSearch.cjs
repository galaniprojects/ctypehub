'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn(
      'Tags',
      'search',
      `tsvector generated always as (to_tsvector('english', "tagName") stored`,
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Tags', 'search');
  },
};
