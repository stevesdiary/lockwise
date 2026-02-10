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
      await queryInterface.addColumn('estates', 'country_code', {
        type: Sequelize.STRING(2),
        allowNull: false,
        defaultValue: 'NG'
      }, { transaction });

      await queryInterface.addColumn('estates', 'timezone', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Africa/Lagos'
      }, { transaction });

      await queryInterface.addColumn('estates', 'currency_code', {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'NGN'
      }, { transaction });

      // Add JSONB columns
      await queryInterface.addColumn('estates', 'location_details', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      }, { transaction });

      await queryInterface.addColumn('estates', 'access_points', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      }, { transaction });

      await queryInterface.addColumn('estates', 'geo_fencing', {
        type: Sequelize.JSONB,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('estates', 'contact_info', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      }, { transaction });

      // Add indexes
      await queryInterface.addIndex('estates', ['country_code'], {
        name: 'estates_country_code_idx',
        transaction
      });

      await queryInterface.addIndex('estates', ['city', 'country_code'], {
        name: 'estates_city_country_idx',
        transaction
      });

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
      }, { transaction });

      await queryInterface.addIndex('gates', ['estate_id'], {
        name: 'gates_estate_id_idx',
        transaction
      });

      await queryInterface.addIndex('gates', ['gate_code'], {
        name: 'gates_gate_code_idx',
        transaction
      });

      // ============ UNITS TABLE UPDATES ============
      const unitColumns = await queryInterface.describeTable('units');
      
      if (unitColumns.number) {
        await queryInterface.renameColumn('units', 'number', 'unit_identifier', { transaction });
      }

      await queryInterface.addColumn('units', 'unit_details', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      }, { transaction });

      await queryInterface.addColumn('units', 'status', {
        type: Sequelize.ENUM('occupied', 'vacant', 'under_construction', 'reserved'),
        allowNull: true,
        defaultValue: 'vacant'
      }, { transaction });

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
      await queryInterface.addIndex('access_logs', ['gate_id'], {
        name: 'access_logs_gate_id_idx',
        transaction
      });

      await queryInterface.addIndex('access_logs', ['unit_id'], {
        name: 'access_logs_unit_id_idx',
        transaction
      });

      await queryInterface.addIndex('access_logs', ['entry_gate_id'], {
        name: 'access_logs_entry_gate_id_idx',
        transaction
      });

      await queryInterface.addIndex('access_logs', ['exit_gate_id'], {
        name: 'access_logs_exit_gate_id_idx',
        transaction
      });
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
