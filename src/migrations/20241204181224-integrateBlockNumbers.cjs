'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, drop the 'search' column since it depends on 'block'
    await queryInterface.removeColumn('CTypes', 'search');

    // Generalized column modification
    const tableName = 'CTypes';
    const columnName = 'block';

    // Step 1: Add a temporary column with the new type
    await queryInterface.addColumn(tableName, 'temporary_col', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });

    // Step 2: Migrate data from the old column to the new column
    const [records] = await queryInterface.sequelize.query(
      `SELECT id, ${columnName} FROM "${tableName}"`,
    );

    // Transformation from string to bigint
    for (const record of records) {
      let blockValue = null;
      try {
        blockValue = BigInt(String(record[columnName]));
      } catch {}

      // just skip if not a valid number
      if (blockValue != null) {
        await queryInterface.sequelize.query(
          `UPDATE "${tableName}" SET temporary_col = ${blockValue} WHERE id = '${record.id}'`,
        );
      }
    }

    // Step 3: Remove the old column
    await queryInterface.removeColumn(tableName, columnName);

    // Step 4: Rename the new column to the original name
    await queryInterface.renameColumn(tableName, 'temporary_col', columnName);

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

    // Generalized column modification
    const tableName = 'CTypes';
    const columnName = 'block';

    // Reverse Step 1: Add the old column back as a string
    await queryInterface.addColumn(tableName, 'temporary_col', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Reverse Step 2: Migrate data from the new column to the old column
    const [records] = await queryInterface.sequelize.query(
      `SELECT id, ${columnName} FROM "${tableName}"`,
    );

    // Transformation from bigInt to string
    for (const record of records) {
      if (record[columnName] != null) {
        await queryInterface.sequelize.query(
          `UPDATE "${tableName}" SET temporary_col = '${record[columnName]}' WHERE id = '${record.id}'`,
        );
      }
    }

    // Reverse Step 3: Remove the new column
    await queryInterface.removeColumn(tableName, columnName);

    // Reverse Step 4: Rename the temp column back to the original name
    await queryInterface.renameColumn(tableName, 'temporary_col', columnName);

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
