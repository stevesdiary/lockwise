module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscription_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      subscription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subscriptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'estates',
          key: 'estate_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_type: {
        type: Sequelize.ENUM(
          'trial_started',
          'trial_ending_soon',
          'trial_ended',
          'plan_selected',
          'payment_successful',
          'payment_failed',
          'subscription_activated',
          'subscription_renewed',
          'subscription_upgraded',
          'subscription_downgraded',
          'grace_period_started',
          'grace_period_ending',
          'grace_period_ended',
          'subscription_lapsed',
          'subscription_suspended',
          'subscription_cancelled',
          'features_restricted',
          'features_restored'
        ),
        allowNull: false
      },
      previous_state: {
        type: Sequelize.ENUM('TRIAL', 'ACTIVE', 'GRACE', 'LAPSED'),
        allowNull: true
      },
      new_state: {
        type: Sequelize.ENUM('TRIAL', 'ACTIVE', 'GRACE', 'LAPSED'),
        allowNull: true
      },
      trigger_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('subscription_events', ['subscription_id']);
    await queryInterface.addIndex('subscription_events', ['estate_id']);
    await queryInterface.addIndex('subscription_events', ['event_type']);
    await queryInterface.addIndex('subscription_events', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subscription_events');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscription_events_event_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscription_events_previous_state";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscription_events_new_state";');
  }
};
