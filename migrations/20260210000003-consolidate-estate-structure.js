'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ============ ESTATES TABLE UPDATES ============
      // Remove old columns
      const estateColumns = await queryInterface.describeTable('estates');
      
      if (estateColumns.address) {
        await queryInterface.removeColumn('estates', 'address', { transaction });
      }
      if (estateColumns.district) {
        await queryInterface.removeColumn('estates', 'district', { transaction });
      }
      if (estateColumns.postal_code) {
        await queryInterface.removeColumn('estates', 'postal_code', { transaction });
      }
      if (estateColumns.contact_phone) {
        await queryInterface.removeColumn('estates', 'contact_phone', { transaction });
      }
      if (estateColumns.contact_email) {
        await queryInterface.removeColumn('estates', 'contact_email', { transaction });
      }
      if (estateColumns.contact_address) {
        await queryInterface.removeColumn('estates', 'contact_address', { transaction });
      }
      if (estateColumns.zip_code) {
        await queryInterface.removeColumn('estates', 'zip_code', { transaction });
      }

      // Add international fields
      await queryInterface.sequelize.query(`
        ALTER TABLE "estates"
          ADD COLUMN IF NOT EXISTS "country_code" VARCHAR(2) NOT NULL DEFAULT 'NG',
          ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(255) NOT NULL DEFAULT 'Africa/Lagos',
          ADD COLUMN IF NOT EXISTS "currency_code" VARCHAR(3) NOT NULL DEFAULT 'NGN',
          ADD COLUMN IF NOT EXISTS "location_details" JSONB DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS "access_points" JSONB DEFAULT '[]',
          ADD COLUMN IF NOT EXISTS "geo_fencing" JSONB,
          ADD COLUMN IF NOT EXISTS "contact_info" JSONB DEFAULT '{}';
      `, { transaction });

      // Add indexes
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "estates_country_code_idx" ON "estates" ("country_code")');

      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "estates_city_country_idx" ON "estates" ("city", "country_code")');

      // ============ GATES TABLE ============
      await queryInterface.createTable('gates', {
        gate_id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
        },
        estate_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'estates',
            key: 'estate_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        gate_code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        gate_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        gate_type: {
          type: Sequelize.ENUM('main', 'service', 'pedestrian', 'emergency', 'vip'),
          allowNull: false,
          defaultValue: 'main',
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        coordinates: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        operating_hours: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        access_control_type: {
          type: Sequelize.ENUM('manual', 'rfid', 'biometric', 'qr_code', 'hybrid'),
          allowNull: true,
          defaultValue: 'manual',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      }, { transaction }, { ifNotExists: true });

      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "gates_estate_id_idx" ON "gates" ("estate_id")');

      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "gates_gate_code_idx" ON "gates" ("gate_code")');

      // ============ UNITS TABLE UPDATES ============
      const unitColumns = await queryInterface.describeTable('units');
      
      if (unitColumns.number) {
        await queryInterface.renameColumn('units', 'number', 'unit_identifier', { transaction });
      }

      await queryInterface.sequelize.query(`
        ALTER TABLE "units"
          ADD COLUMN IF NOT EXISTS "unit_details" JSONB DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'vacant';
      `, { transaction });

      // Update unit_type enum - check if enum exists first
      const enumExists = await queryInterface.sequelize.query(
        `SELECT 1 FROM pg_type WHERE typname = 'enum_units_unit_type';`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (enumExists.length > 0) {
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_units_unit_type" ADD VALUE IF NOT EXISTS 'plot';`,
          { transaction }
        );
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_units_unit_type" ADD VALUE IF NOT EXISTS 'house';`,
          { transaction }
        );
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_units_unit_type" ADD VALUE IF NOT EXISTS 'apartment';`,
          { transaction }
        );
      }

      // ============ ACCESS LOGS TABLE UPDATES ============
      const accessLogColumns = await queryInterface.describeTable('access_logs');
      
      if (!accessLogColumns.gate_id) {
        await queryInterface.addColumn('access_logs', 'gate_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'gates',
            key: 'gate_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
      }

      if (!accessLogColumns.unit_id) {
        await queryInterface.addColumn('access_logs', 'unit_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'units',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
      }

      if (!accessLogColumns.entry_gate_id) {
        await queryInterface.addColumn('access_logs', 'entry_gate_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'gates',
            key: 'gate_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
      }

      if (!accessLogColumns.exit_gate_id) {
        await queryInterface.addColumn('access_logs', 'exit_gate_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'gates',
            key: 'gate_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
      }

      if (!accessLogColumns.verification_method) {
        await queryInterface.addColumn('access_logs', 'verification_method', {
          type: Sequelize.ENUM('rfid', 'qr_code', 'access_code', 'biometric', 'manual'),
          allowNull: true,
        }, { transaction });
      }

      if (!accessLogColumns.scanned_by) {
        await queryInterface.addColumn('access_logs', 'scanned_by', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
      }

      if (!accessLogColumns.visitor_details) {
        await queryInterface.addColumn('access_logs', 'visitor_details', {
          type: Sequelize.JSONB,
          allowNull: true,
        }, { transaction });
      }

      // Add indexes
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "access_logs_gate_id_idx" ON "access_logs" ("gate_id")');

      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "access_logs_unit_id_idx" ON "access_logs" ("unit_id")');

      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "access_logs_entry_gate_id_idx" ON "access_logs" ("entry_gate_id")');

      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "access_logs_exit_gate_id_idx" ON "access_logs" ("exit_gate_id")');
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Reverse access_logs changes
      await queryInterface.removeColumn('access_logs', 'gate_id', { transaction });
      await queryInterface.removeColumn('access_logs', 'unit_id', { transaction });
      await queryInterface.removeColumn('access_logs', 'entry_gate_id', { transaction });
      await queryInterface.removeColumn('access_logs', 'exit_gate_id', { transaction });
      await queryInterface.removeColumn('access_logs', 'verification_method', { transaction });
      await queryInterface.removeColumn('access_logs', 'scanned_by', { transaction });
      await queryInterface.removeColumn('access_logs', 'visitor_details', { transaction });

      // Drop gates table
      await queryInterface.dropTable('gates', { transaction });

      // Reverse units changes
      await queryInterface.removeColumn('units', 'unit_details', { transaction });
      await queryInterface.removeColumn('units', 'status', { transaction });
      await queryInterface.renameColumn('units', 'unit_identifier', 'number', { transaction });

      // Reverse estates changes
      await queryInterface.removeColumn('estates', 'country_code', { transaction });
      await queryInterface.removeColumn('estates', 'timezone', { transaction });
      await queryInterface.removeColumn('estates', 'currency_code', { transaction });
      await queryInterface.removeColumn('estates', 'location_details', { transaction });
      await queryInterface.removeColumn('estates', 'access_points', { transaction });
      await queryInterface.removeColumn('estates', 'geo_fencing', { transaction });
      await queryInterface.removeColumn('estates', 'contact_info', { transaction });
    });
  },
};
