import { Sequelize } from "sequelize";

const {
    sequelizeConfig
} = require("../env.json");

const sequelize = process.env.DATABASE_URL ?
    new Sequelize(process.env.DATABASE_URL) :
    new Sequelize(sequelizeConfig.database, sequelizeConfig.username, sequelizeConfig.password, sequelizeConfig.options);

export { sequelize }
export default sequelize