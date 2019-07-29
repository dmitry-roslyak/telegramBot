"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const init_1 = require("./init");
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
}, { sequelize: init_1.default });
Favorite.init({
    user_id: { type: sequelize_1.DataTypes.INTEGER },
    name: { type: sequelize_1.DataTypes.STRING },
    href: sequelize_1.DataTypes.STRING,
}, { sequelize: init_1.default });
init_1.default.sync();
exports.default = { Query, Favorite };
//# sourceMappingURL=models.js.map