'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // First, drop the 'search' column since it depends on 'extrinsicHash'
    await queryInterface.removeColumn('CTypes', 'search');

    // safely drop the 'extrinsicHash' column
    await queryInterface.removeColumn('CTypes', 'extrinsicHash');

    // recreate the 'search' column without 'extrinsicHash'
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
        coalesce("block"::text, '') || ' ' ||
        coalesce("description"::text, ''))
      ) stored`,
    );
  },

  async down(queryInterface, Sequelize) {
    // First, drop the 'search' column
    await queryInterface.removeColumn('CTypes', 'search');
    // Recreate the 'extrinsicHash' column
    await queryInterface.addColumn('CTypes', 'extrinsicHash', {
      type: Sequelize.STRING,
      allowNull: false,
    });
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
};
