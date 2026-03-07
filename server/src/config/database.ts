import { Sequelize } from 'sequelize';
import path from 'path';
import { env } from './env';

const dbPath = path.resolve(__dirname, '../../../data/attendance.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: env.nodeEnv === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export default sequelize;
