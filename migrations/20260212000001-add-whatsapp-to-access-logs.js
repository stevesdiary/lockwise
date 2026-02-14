'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('access_logs', 'guest_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('access_logs', 'guest_phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('access_logs', 'whatsapp_sent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    
    await queryInterface.addColumn('access_logs', 'whatsapp_sent_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('access_logs', 'guest_name');
    await queryInterface.removeColumn('access_logs', 'guest_phone');
    await queryInterface.removeColumn('access_logs', 'whatsapp_sent');
    await queryInterface.removeColumn('access_logs', 'whatsapp_sent_at');
  }
};
