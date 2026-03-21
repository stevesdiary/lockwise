'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add 'draft' to the estates.status ENUM
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_estates_status" ADD VALUE IF NOT EXISTS 'draft'`
    );

    // 2. Add onboarding_step column
    await queryInterface.addColumn('estates', 'onboarding_step', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: true,
    });

    // 3. Add setup_checklist column
    await queryInterface.addColumn('estates', 'setup_checklist', {
      type: Sequelize.JSONB,
      defaultValue: { gates_configured: false, residents_invited: false },
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('estates', 'setup_checklist');
    await queryInterface.removeColumn('estates', 'onboarding_step');
    // Note: Postgres does not support removing ENUM values natively.
    // 'draft' removal would require full ENUM type recreation — skipped for dev rollback.
  },
};
