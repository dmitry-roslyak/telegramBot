"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
let sequelizeDefaultOptions = {
    "define": {
        "underscored": true,
        "timestamps": true
    },
    "logging": false
};
if (process.env.SSL_ENABLED == "true") {
    sequelizeDefaultOptions["dialectOptions"] = {
        "ssl": true
    };
}
if (!process.env.DATABASE_URL)
    throw "DATABASE_URL is undefined";
const sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL, sequelizeDefaultOptions);
exports.sequelize = sequelize;
class Query extends sequelize_1.Model {
}
exports.Query = Query;
class Favorite extends sequelize_1.Model {
}
exports.Favorite = Favorite;
Query.init({
    chat_id: { type: sequelize_1.DataTypes.INTEGER },
    message_id: { type: sequelize_1.DataTypes.INTEGER },
    action: { type: sequelize_1.DataTypes.STRING },
    data: sequelize_1.DataTypes.TEXT,
}, { sequelize });
Favorite.init({
    user_id: { type: sequelize_1.DataTypes.INTEGER },
    mmsi: { type: sequelize_1.DataTypes.INTEGER },
    name: { type: sequelize_1.DataTypes.STRING },
    country: sequelize_1.DataTypes.STRING,
    href: sequelize_1.DataTypes.STRING,
}, { sequelize });
sequelize.sync();
//# sourceMappingURL=models.js.map