'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('access_granted', 'access_denied', 'visitor_arrival', 'system_alert', 'payment_reminder'),
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    }, { ifNotExists: true });

    // Add indexes
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "notifications_user_id" ON "notifications" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "notifications_type" ON "notifications" ("type")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "notifications_is_read" ON "notifications" ("is_read")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "notifications_created_at" ON "notifications" ("created_at")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
  }
};