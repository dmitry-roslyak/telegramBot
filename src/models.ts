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

sequelize
    .sync()
    .then(() =>
        Favorite.create({
            user_id: 1,
            name: "fufufu",
            href: ""
            // birthday: new Date(1980, 6, 20)
        })
    )
    .then((jane: any) => {
        console.log(jane.toJSON());
    });
sequelize
    .sync()
    .then(() =>
        Query.create({
            message_id: 1,
            data: ""
            // birthday: new Date(1980, 6, 20)
        })
    )
    .then((jane: any) => {
        console.log(jane.toJSON());
    });

// Product.belongsTo(Discount);
// Product.hasMany(Spec, { foreignKey: "prod_id", constraints: false });
// Product.Specs = Product.hasMany(Spec, { foreignKey: "prod_id", constraints: false });

export { Query, Favorite }
export default { Query, Favorite }
