"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
const telegramBot_t_1 = require("./telegramBot.t");
const sequelize_1 = require("sequelize");
class DB {
    constructor(chat_id) {
        this.chat_id = chat_id;
    }
    queryfindOne(message_id) {
        return models_1.Query.findOne({
            where: {
                chat_id: this.chat_id,
                message_id
            }
        });
    }
    queryCreate(message, data) {
        let message_id = message.result.message_id;
        return models_1.Query.create({
            message_id,
            chat_id: this.chat_id,
            data: JSON.stringify(data),
        });
    }
    favoriteFindOne(data) {
        return models_1.Favorite.findOne({
            where: {
                [sequelize_1.Op.and]: { user_id: this.chat_id },
                [sequelize_1.Op.or]: [{ href: data[telegramBot_t_1.VesselProperty.href] }],
            }
        });
    }
    favoriteFindOneOrCreate(data, href) {
        return __awaiter(this, void 0, void 0, function* () {
            let fav = yield this.favoriteFindOne(data);
            return fav || models_1.Favorite.create({
                user_id: this.chat_id,
                name: data[telegramBot_t_1.VesselProperty.name],
                country: data[telegramBot_t_1.VesselProperty.flag],
                href
            });
        });
    }
    favorites() {
        return models_1.Favorite.findAll({ where: { user_id: this.chat_id } });
    }
    favoriteRemove(href) {
        return __awaiter(this, void 0, void 0, function* () {
            let fav = yield this.favoriteFindOne({ href });
            return fav && fav.destroy();
        });
    }
}
exports.DB = DB;
//# sourceMappingURL=db.js.map