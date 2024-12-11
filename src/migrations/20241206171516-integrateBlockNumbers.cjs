'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, drop the 'search' column since it depends on 'block'
    await queryInterface.removeColumn('CTypes', 'search');

    // Transformation the type of 'block' from string to bigint
    await queryInterface.changeColumn('CTypes', 'block', {
      type: 'BIGINT using (block::bigint)',
      allowNull: true,
    });
    // recreate the 'search' column
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
    // First, drop the 'search' column since it depends on 'block'
    await queryInterface.removeColumn('CTypes', 'search');

    // Transformation the type of 'block' from bigint to string
    await queryInterface.changeColumn('CTypes', 'block', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // recreate the 'search' column
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
};
