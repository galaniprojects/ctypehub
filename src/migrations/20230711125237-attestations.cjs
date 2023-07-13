'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    sequelize.define('Attestation', {
      claimHash: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      cTypeId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      owner: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      delegationId: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      extrinsicHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      block: {
        type: Sequelize.STRING,
      },
    }, { indexes: [{ fields: ['cTypeId'] }] });

    await sequelize.sync();
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Attestations');
  },
};
