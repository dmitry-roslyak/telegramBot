"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
const telegramBot_t_1 = require("./telegramBot.t");
const sequelize_1 = require("sequelize");
class DB {
    static queryfindOne(chat_id, message_id) {
        return models_1.Query.findOne({
            where: {
                chat_id,
                message_id,
            },
        }).catch((err) => console.error(err));
    }
    static queryCreate(chat_id, message_id, data) {
        return models_1.Query.create({
            message_id,
            chat_id,
            data: JSON.stringify(data),
        }).catch((err) => console.error(err));
    }
    static favoriteFindOne(user_id, data) {
        return models_1.Favorite.findOne({
            where: {
                [sequelize_1.Op.and]: { user_id },
                [sequelize_1.Op.or]: [{ mmsi: data[telegramBot_t_1.VesselProperty.MMSI] }, { href: data[telegramBot_t_1.VesselProperty.href] }],
            },
        }).catch((err) => console.error(err));
    }
    static favoriteFindOneOrCreate(user_id, data, href) {
        return __awaiter(this, void 0, void 0, function* () {
            const fav = yield this.favoriteFindOne(user_id, data);
            return (fav ||
                models_1.Favorite.create({
                    user_id,
                    mmsi: data[telegramBot_t_1.VesselProperty.MMSI],
                    name: data[telegramBot_t_1.VesselProperty.name],
                    country: data[telegramBot_t_1.VesselProperty.flag],
                    href,
                }).catch((err) => console.error(err)));
        });
    }
    static favorites(user_id) {
        return models_1.Favorite.findAll({ where: { user_id } }).catch((err) => {
            console.error(err);
            return [];
        });
    }
    static favoriteRemove(user_id, href) {
        return __awaiter(this, void 0, void 0, function* () {
            const fav = yield this.favoriteFindOne(user_id, { href });
            return fav && fav.destroy().catch((err) => console.error(err));
        });
    }
}
exports.DB = DB;
//# sourceMappingURL=db.js.map