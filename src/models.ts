import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';
import sequelize from './init';

class Query extends Model { }
class Favorite extends Model { }

Query.init({
    chat_id: { type: DataTypes.INTEGER },
    message_id: { type: DataTypes.INTEGER },
    action: { type: DataTypes.STRING },
    data: DataTypes.TEXT,
}, { sequelize });

Favorite.init({
    user_id: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },
    href: DataTypes.STRING,
}, { sequelize });

sequelize.sync()

// Product.belongsTo(Discount);
// Product.hasMany(Spec, { foreignKey: "prod_id", constraints: false });
// Product.Specs = Product.hasMany(Spec, { foreignKey: "prod_id", constraints: false });

export { Query, Favorite }
export default { Query, Favorite }
