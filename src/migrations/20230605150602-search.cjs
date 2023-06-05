'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn(
      'CTypes',
      'search',
      `tsvector generated always as (to_tsvector('english',
        coalesce("id"::text, '') || ' ' ||
        coalesce("schema"::text, '') || ' ' ||
        coalesce("title"::text, '') || ' ' ||
        coalesce("properties"::text, '') || ' ' ||
        coalesce("type"::text, '') || ' ' ||
        coalesce("creator"::text, '') || ' ' ||
        coalesce("extrinsicHash"::text, '') || ' ' ||
        coalesce("block"::text, '') || ' ' ||
        coalesce("description"::text, ''))
      ) stored`,
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('CTypes', 'search');
  },
};
