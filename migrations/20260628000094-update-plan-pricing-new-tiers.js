'use strict';

/**
 * Update plans to new pricing tiers:
 *   Starter    — ₦40,000/mo, ₦110,000/qtr, ₦380,000/yr  — cap 200
 *   Growth     — ₦65,000/mo, ₦180,000/qtr, ₦620,000/yr  — cap 500
 *   Estate Pro — ₦170,000/mo, ₦460,000/qtr, ₦1,630,000/yr — cap 999
 *   Enterprise — custom pricing                            — cap 1000+
 */
module.exports = {
  up: async (queryInterface) => {
    const plans = [
      { tier: 'starter',    cycle: 'monthly',    price: 40000,   cap: 200  },
      { tier: 'starter',    cycle: 'quarterly',  price: 110000,  cap: 200  },
      { tier: 'starter',    cycle: 'annually',   price: 380000,  cap: 200  },
      { tier: 'growth',     cycle: 'monthly',    price: 65000,   cap: 500  },
      { tier: 'growth',     cycle: 'quarterly',  price: 180000,  cap: 500  },
      { tier: 'growth',     cycle: 'annually',   price: 620000,  cap: 500  },
      { tier: 'estate_pro', cycle: 'monthly',    price: 170000,  cap: 999  },
      { tier: 'estate_pro', cycle: 'quarterly',  price: 460000,  cap: 999  },
      { tier: 'estate_pro', cycle: 'annually',   price: 1630000, cap: 999  },
      { tier: 'enterprise', cycle: 'monthly',    price: 0,       cap: 1000 },
      { tier: 'enterprise', cycle: 'quarterly',  price: 0,       cap: 1000 },
      { tier: 'enterprise', cycle: 'annually',   price: 0,       cap: 1000 },
    ];

    for (const p of plans) {
      const name = `${p.tier}_${p.cycle}`;
      await queryInterface.sequelize.query(
        `UPDATE plans SET price = :price, price_paid = :price, resident_cap = :cap, updated_at = NOW()
         WHERE name = :name`,
        { replacements: { name, price: p.price, cap: p.cap } }
      );
    }

    // Remove old tiers no longer in use
    await queryInterface.sequelize.query(
      `DELETE FROM plans WHERE name LIKE 'basic_%' OR name LIKE 'premium_%'`
    );
  },

  down: async () => {
    // Intentionally left blank — revert manually if needed
  },
};
