'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('access_logs', 'gate_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'gates', key: 'gate_id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('access_logs', 'gate_id');
  },
};
