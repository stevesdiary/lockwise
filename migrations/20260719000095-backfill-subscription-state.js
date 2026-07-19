module.exports = {
  up: async (queryInterface) => {
    // Migration 20260520000090 added `subscription_state` defaulting every existing
    // row to 'TRIAL' with no backfill from the older `status` column. Rows with
    // `trial_start_date IS NULL` predate the state machine and were never real
    // trials — derive their real state from `status` instead.

    // status: active -> ACTIVE
    await queryInterface.sequelize.query(`
      UPDATE subscriptions
      SET subscription_state = 'ACTIVE',
          grace_period_end_date = NULL,
          lapsed_start_date = NULL
      WHERE subscription_state = 'TRIAL'
        AND trial_start_date IS NULL
        AND status = 'active';
    `);

    // status: grace_period -> GRACE
    await queryInterface.sequelize.query(`
      UPDATE subscriptions
      SET subscription_state = 'GRACE',
          grace_period_end_date = COALESCE(grace_period_end_date, updated_at)
      WHERE subscription_state = 'TRIAL'
        AND trial_start_date IS NULL
        AND status = 'grace_period';
    `);

    // status: cancelled/expired -> LAPSED
    await queryInterface.sequelize.query(`
      UPDATE subscriptions
      SET subscription_state = 'LAPSED',
          lapsed_start_date = COALESCE(lapsed_start_date, updated_at)
      WHERE subscription_state = 'TRIAL'
        AND trial_start_date IS NULL
        AND status IN ('cancelled', 'expired');
    `);

    // status: inactive is left as TRIAL — these rows never had a confirmed payment.
  },

  down: async () => {
    // Data backfill only; not reversible.
  },
};
