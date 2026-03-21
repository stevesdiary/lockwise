import sequelize from '../core/database';

export const dbService = {
  query: (sql: string, replacements?: any[]) =>
    sequelize.query(sql, { replacements }),

  transaction: () => sequelize.transaction(),

  getHealthStatus: async () => {
    try {
      await sequelize.authenticate();
      return { status: 'healthy' };
    } catch (error: any) {
      return { status: 'unhealthy', error: error.message };
    }
  },
};
