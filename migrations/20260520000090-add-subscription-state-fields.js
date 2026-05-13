module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('subscriptions', 'subscription_state', {
      type: Sequelize.ENUM('TRIAL', 'ACTIVE', 'GRACE', 'LAPSED'),
      allowNull: false,
      defaultValue: 'TRIAL',
      after: 'status'
    });

    await queryInterface.addColumn('subscriptions', 'trial_start_date', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'subscription_state'
    });

    await queryInterface.addColumn('subscriptions', 'trial_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'trial_start_date'
    });

    await queryInterface.addColumn('subscriptions', 'billing_cycle', {
      type: Sequelize.ENUM('monthly', 'quarterly', 'annually'),
      allowNull: true,
      after: 'plan_id'
    });

    await queryInterface.addColumn('subscriptions', 'next_billing_date', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'end_date'
    });

    await queryInterface.addColumn('subscriptions', 'paystack_subscription_code', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'next_billing_date'
    });

    await queryInterface.addColumn('subscriptions', 'paystack_customer_code', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'paystack_subscription_code'
    });

    await queryInterface.addColumn('subscriptions', 'resident_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'paystack_customer_code'
    });

    await queryInterface.addColumn('subscriptions', 'resident_cap', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'resident_count'
    });

    await queryInterface.addColumn('subscriptions', 'lapsed_start_date', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'grace_period_end_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('subscriptions', 'lapsed_start_date');
    await queryInterface.removeColumn('subscriptions', 'resident_cap');
    await queryInterface.removeColumn('subscriptions', 'resident_count');
    await queryInterface.removeColumn('subscriptions', 'paystack_customer_code');
    await queryInterface.removeColumn('subscriptions', 'paystack_subscription_code');
    await queryInterface.removeColumn('subscriptions', 'next_billing_date');
    await queryInterface.removeColumn('subscriptions', 'billing_cycle');
    await queryInterface.removeColumn('subscriptions', 'trial_end_date');
    await queryInterface.removeColumn('subscriptions', 'trial_start_date');
    await queryInterface.removeColumn('subscriptions', 'subscription_state');
    
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscriptions_subscription_state";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscriptions_billing_cycle";');
  }
};
