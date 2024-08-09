'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /**
     * Reverts (combines `down` functions of) following migrations:
     * - `20230712145719-foreignKeys.cjs`
     * - `20230711125237-attestations.cjs`
     */
    await queryInterface.removeConstraint(
      'Attestations',
      'Attestations_cTypeId_fkey',
    );

    await queryInterface.dropTable('Attestation');
  },

  async down(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    /**
     * Recreates (combines `up` functions of) following migrations:
     * - `20230712145719-foreignKeys.cjs`
     * - `20230711125237-attestations.cjs`
     */
    sequelize.define(
      'Attestation',
      {
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
      },
      { indexes: [{ fields: ['cTypeId'] }] },
    );
    await sequelize.sync();

    await queryInterface.addConstraint('Attestations', {
      type: 'foreign key',
      name: 'Attestations_cTypeId_fkey',
      fields: ['cTypeId'],
      references: { table: 'CTypes', field: 'id' },
    });
  },
};
