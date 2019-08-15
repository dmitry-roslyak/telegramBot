import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';

const sequelizeDefaultOptions = {
    "define": {
        "underscored": true,
        "timestamps": true
    },
    "logging": false
}

if (!process.env.DATABASE_URL) throw "DATABASE_URL is undefined";
const sequelize = new Sequelize(process.env.DATABASE_URL, sequelizeDefaultOptions)

class Query extends Model { }
class Favorite extends Model {
    id: string
}

Query.init({
    chat_id: { type: DataTypes.INTEGER },
    message_id: { type: DataTypes.INTEGER },
    action: { type: DataTypes.STRING },
    data: DataTypes.TEXT,
}, { sequelize });

Favorite.init({
    user_id: { type: DataTypes.INTEGER },
    mmsi: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },
    country: DataTypes.STRING,
    href: DataTypes.STRING,
}, { sequelize });

sequelize.sync()

export { Query, Favorite, sequelize }