'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'CTypes';
    const columnName = 'block';

    // Step 1: Add a temporary column with the new type
    await queryInterface.addColumn(tableName, 'temporary_col', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Step 2: Migrate data from the old column to the new column
    const [records] = await queryInterface.sequelize.query(
      `SELECT id, ${columnName} FROM "${tableName}"`,
    );

    // Transformation from string to integer
    for (const record of records) {
      const blockValue = parseInt(String(record[columnName]), 10);
      if (!isNaN(blockValue)) {
        await queryInterface.sequelize.query(
          `UPDATE "${tableName}" SET temporary_col = ${blockValue} WHERE id = '${record.id}'`,
        );
      }
    }

    // Step 3: Remove the old column
    await queryInterface.removeColumn(tableName, columnName);

    // Step 4: Rename the new column to the original name
    await queryInterface.renameColumn(tableName, 'temporary_col', columnName);
  },

  async down(queryInterface, Sequelize) {
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

    for (const record of records) {
      await queryInterface.sequelize.query(
        `UPDATE "${tableName}" SET temporary_col = '${record[columnName]}' WHERE id = '${record.id}'`,
      );
    }

    // Reverse Step 3: Remove the new column
    await queryInterface.removeColumn(tableName, columnName);

    // Reverse Step 4: Rename the temp column back to the original name
    await queryInterface.renameColumn(tableName, 'temporary_col', columnName);
  },
};
