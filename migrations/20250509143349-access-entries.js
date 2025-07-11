'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_entries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      access_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'accesses', // ✅ must exist and be primary/unique
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      entry_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      exit_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      scanned_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      gate_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('access_entries');
  }
};


// 'use strict';

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('access_entries', {
//       id: {
//         type: Sequelize.UUID,
//         primaryKey: true,
//         defaultValue: Sequelize.UUIDV4,
//         allowNull: false
//       },
//       access_id: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         references: {
//           model: 'accesses',
//           key: 'id',
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE',
//       },
//       entry_time: {
//         type: Sequelize.DATE,
//         allowNull: false,
//       },
//       exit_time: {
//         type: Sequelize.DATE,
//         allowNull: true,
//       },
//       scanned_by: {
//         type: Sequelize.STRING,
//         allowNull: true,
//       },
//       gate_id: {
//         type: Sequelize.STRING,
//         allowNull: true,
//       },
//       created_at: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.fn('NOW')
//       },
//       updated_at: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.fn('NOW')
//       },
//       deleted_at: {
//         type: Sequelize.DATE,
//         allowNull: true
//       }
//     });
//   },

//   down: async (queryInterface) => {
//     await queryInterface.dropTable('access_entries');
//   },
// };
