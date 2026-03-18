"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("api_keys", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      name: { type: Sequelize.STRING(255), allowNull: false },
      key_hash: { 
        type: Sequelize.STRING(255), 
        allowNull: false, 
        unique: true 
      },
      permissions: { type: Sequelize.ARRAY(Sequelize.TEXT), defaultValue: [] },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_by: {
        type: Sequelize.UUID,
        references: { model: "users", key: "id" },
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      last_used: { type: Sequelize.DATE },
    }, { ifNotExists: true });

    await queryInterface.createTable("audit_logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: "users", key: "id" },
      },
      method: { type: Sequelize.STRING(10), allowNull: false },
      path: { type: Sequelize.STRING(500), allowNull: false },
      status_code: { type: Sequelize.INTEGER, allowNull: false },
      ip_address: { type: Sequelize.INET },
      user_agent: { type: Sequelize.TEXT },
      duration_ms: { type: Sequelize.INTEGER },
      request_body: { type: Sequelize.JSONB },
      response_body: { type: Sequelize.JSONB },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    }, { ifNotExists: true });

    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_api_keys_hash" ON "api_keys" ("key_hash")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_api_keys_active" ON "api_keys" ("is_active")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_audit_logs_user" ON "audit_logs" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_audit_logs_created" ON "audit_logs" ("created_at")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_audit_logs_path" ON "audit_logs" ("path")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("audit_logs");
    await queryInterface.dropTable("api_keys");
  },
};
