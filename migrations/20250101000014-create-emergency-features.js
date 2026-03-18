'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create emergency_alerts table
    await queryInterface.createTable('emergency_alerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'estates',
          key: 'estate_id'
        }
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      type: {
        type: Sequelize.ENUM('fire', 'medical', 'security', 'flood', 'power_outage', 'other'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'resolved', 'false_alarm'),
        allowNull: false,
        defaultValue: 'active'
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolved_by: {
        type: Sequelize.UUID,
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

    // Create emergency_contacts table
    await queryInterface.createTable('emergency_contacts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'estates',
          key: 'estate_id'
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('fire', 'police', 'ambulance', 'hospital', 'security', 'maintenance'),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Create support_tickets table
    await queryInterface.createTable('support_tickets', {
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
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('technical', 'billing', 'access', 'general'),
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'open'
      },
      assigned_to: {
        type: Sequelize.UUID,
        allowNull: true
      },
      resolved_at: {
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

    // Create support_messages table
    await queryInterface.createTable('support_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      ticket_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'support_tickets',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_internal: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "emergency_alerts_estate_id" ON "emergency_alerts" ("estate_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "emergency_alerts_status" ON "emergency_alerts" ("status")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "emergency_contacts_estate_id" ON "emergency_contacts" ("estate_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "emergency_contacts_type" ON "emergency_contacts" ("type")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "support_tickets_user_id" ON "support_tickets" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "support_tickets_status" ON "support_tickets" ("status")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "support_messages_ticket_id" ON "support_messages" ("ticket_id")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('support_messages');
    await queryInterface.dropTable('support_tickets');
    await queryInterface.dropTable('emergency_contacts');
    await queryInterface.dropTable('emergency_alerts');
  }
};