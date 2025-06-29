'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accesses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // ✅ correct FK target
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'estates', // ✅ correct FK target
          key: 'estate_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      access_code: Sequelize.STRING,
      exit_code: Sequelize.STRING,
      
      set_date_in: Sequelize.DATE,
      set_date_out: Sequelize.DATE,
      set_entry_time: Sequelize.STRING,
      set_exit_time: Sequelize.STRING,

      entry_date: Sequelize.DATE,
      exit_date: Sequelize.DATE,

      entry_time: Sequelize.STRING,
      exit_time: Sequelize.STRING,

      vehicle_number: Sequelize.STRING,
      status: Sequelize.STRING,
      remarks: Sequelize.TEXT,

      is_multi_entry: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      created_by: Sequelize.STRING,
      approved_by: Sequelize.STRING,

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
    await queryInterface.dropTable('accesses');
  }
};


// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     await queryInterface.createTable('accesses', {
//       id: {
//         primaryKey: true,
//         type: Sequelize.UUID,
//         defaultValue: Sequelize.UUIDV4,
//         allowNull: false
//       },
//       user_id: {
//         type: Sequelize.UUID,
//         allowNull: false,
//         references: {
//           model: 'users',
//           key: 'id'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'SET_NULL'
//       },
//       estate_id: {
//         type: Sequelize.UUID,
//         allowNull: false,
//         references: {
//           model: 'estates',
//           key: 'estate_id'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE'
//       },
//       access_code: {
//         type: Sequelize.STRING
//       },
//       exit_code: {
//         type: Sequelize.STRING
//       },
//       set_date_in: {
//         type: Sequelize.DATE
//       },
//       set_date_out: {
//         type: Sequelize.DATE
//       },
//       set_entry_time: {
//         type: Sequelize.STRING
//       },
//       set_exit_time: {
//         type: Sequelize.STRING
//       },
//       entry_date: {
//         type: Sequelize.DATE
//       },
//       exit_date: {
//         type: Sequelize.DATE
//       },
//       vehicle_number: {
//         type: Sequelize.STRING
//       },
//       status: {
//         type: Sequelize.STRING
//       },
//       remarks: {
//         type: Sequelize.STRING
//       },
//       is_multi_entry: {
//         type: Sequelize.BOOLEAN,
//       },
//       created_by: {
//         type: Sequelize.STRING
//       },
//       created_at: {
//         type: Sequelize.DATE,
//         allowNull: false
//       },
//       updated_at: {
//         type: Sequelize.DATE,
//         allowNull: false
//       },
//       deleted_at: {
//         type: Sequelize.DATE,
//         allowNull: true
//       }
//     })
//   },

//   async down (queryInterface, Sequelize) {
//     await queryInterface.dropTable('accesses')
//   }
// };
