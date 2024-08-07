'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('Tags', ['cTypeId', 'tagName'], {
      unique: true,
      name: 'tags_c_type_id_tag_name',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Tags', 'tags_c_type_id_tag_name');
  },
};
