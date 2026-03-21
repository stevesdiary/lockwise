'use strict';

// NEW: This table was missing from migrations but ReferralBonus model exists and is registered.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('referral_bonuses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      referrer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'referrers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bonus_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0 },
      paid: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      payment_reference: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('referral_bonuses', ['referrer_id']);
    await queryInterface.addIndex('referral_bonuses', ['estate_id']);
    await queryInterface.addIndex('referral_bonuses', ['paid']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('referral_bonuses');
  },
};
