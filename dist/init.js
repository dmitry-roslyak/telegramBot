"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const { sequelizeConfig } = require("../env.json");
const sequelize = process.env.DATABASE_URL ?
    new sequelize_1.Sequelize(process.env.DATABASE_URL) :
    new sequelize_1.Sequelize(sequelizeConfig.database, sequelizeConfig.username, sequelizeConfig.password, sequelizeConfig.options);
exports.sequelize = sequelize;
exports.default = sequelize;
//# sourceMappingURL=init.js.map