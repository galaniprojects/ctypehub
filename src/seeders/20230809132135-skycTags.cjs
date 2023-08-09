'use strict';

const tags = [
  {
    name: 'Twitter',
    cTypeId:
      'kilt:ctype:0x47d04c42bdf7fdd3fc5a194bcaa367b2f4766a6b16ae3df628927656d818f420',
    tags: ['Twitter', 'Login', 'social'],
  },
  {
    name: 'Email',
    cTypeId:
      'kilt:ctype:0x3291bb126e33b4862d421bfaa1d2f272e6cdfc4f96658988fbcffea8914bd9ac',
    tags: ['Email', 'Login'],
  },
  {
    name: 'Discord',
    cTypeId:
      'kilt:ctype:0xd8c61a235204cb9e3c6acb1898d78880488846a7247d325b833243b46d923abe',
    tags: ['Discord', 'Login', 'social'],
  },
  {
    name: 'GitHub',
    cTypeId:
      'kilt:ctype:0xad52bd7a8bd8a52e03181a99d2743e00d0a5e96fdc0182626655fcf0c0a776d0',
    tags: ['GitHub', 'Login'],
  },
  {
    name: 'Twitch',
    cTypeId:
      'kilt:ctype:0x568ec5ffd7771c4677a5470771adcdea1ea4d6b566f060dc419ff133a0089d80',
    tags: ['Twitch', 'Login', 'social'],
  },
  {
    name: 'Telegram',
    cTypeId:
      'kilt:ctype:0xcef8f3fe5aa7379faea95327942fd77287e1c144e3f53243e55705f11e890a4c',
    tags: ['Telegram', 'phone'],
  },
  {
    name: 'YouTube',
    cTypeId:
      'kilt:ctype:0x329a2a5861ea63c250763e5e4c4d4a18fe4470a31e541365c7fb831e5432b940',
    tags: ['YouTube', 'social'],
  },
].flatMap(({ cTypeId, tags }) => tags.map((tagName) => ({ cTypeId, tagName })));

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const createdAt = new Date();
    const updatedAt = new Date();
    const newTags = tags.map((tag) => ({
      ...tag,
      createdAt,
      updatedAt,
    }));

    await queryInterface.bulkInsert('Tags', newTags);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tags', Sequelize.or(...tags));
  },
};
