import { Sequelize, Model, DataTypes } from "sequelize";

const sequelizeDefaultOptions: any = {
  define: {
    underscored: true,
    timestamps: true,
  },
  logging: false,
};

if (process.env.SSL_ENABLED === "true") {
  sequelizeDefaultOptions.dialectOptions = {
    ssl: true,
  };
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is undefined");
const sequelize = new Sequelize(process.env.DATABASE_URL, sequelizeDefaultOptions);

class Query extends Model {
  data: string;
}
class Favorite extends Model {
  id: string;
}

Query.init(
  {
    chat_id: { type: DataTypes.BIGINT },
    message_id: { type: DataTypes.INTEGER },
    action: { type: DataTypes.STRING },
    data: DataTypes.TEXT,
  },
  { sequelize }
);

Favorite.init(
  {
    user_id: { type: DataTypes.BIGINT },
    mmsi: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },
    country: DataTypes.STRING,
    href: DataTypes.STRING,
  },
  { sequelize }
);

sequelize.sync();

export { Query, Favorite, sequelize };
