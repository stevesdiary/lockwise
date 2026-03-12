'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('residents', 'unit_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'units', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('residents', 'estate_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'estates', key: 'estate_id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('residents', 'unit_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'units', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.changeColumn('residents', 'estate_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'estates', key: 'estate_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
