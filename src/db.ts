import { Query, Favorite } from "./models";
import { VesselProperty, Vessel } from "./telegramBot.t";
import { Op } from "sequelize";

class DB {
    static queryfindOne(chat_id: number, message_id: number) {
        return Query.findOne({
            where: {
                chat_id,
                message_id
            }
        })
    }
    static queryCreate(chat_id: number, message: any, data: any) {
        let message_id = message.result.message_id
        return Query.create({
            message_id,
            chat_id,
            data: JSON.stringify(data),
        })
    }
    static favoriteFindOne(user_id: number, data: Vessel) {
        return Favorite.findOne({
            where: {
                [Op.and]: { user_id },
                [Op.or]: [{ mmsi: data[VesselProperty.MMSI] }, { href: data[VesselProperty.href] }],
            }
        })
    }
    static async favoriteFindOneOrCreate(user_id: number, data: any, href: string) {
        let fav = await this.favoriteFindOne(user_id, data)

        return fav || Favorite.create({
            user_id,
            mmsi: data[VesselProperty.MMSI],
            name: data[VesselProperty.name],
            country: data[VesselProperty.flag],
            href
        })
    }
    static favorites(user_id: number) {
        return Favorite.findAll({ where: { user_id } })
    }
    static async favoriteRemove(user_id: number, href: string) {
        let fav = await this.favoriteFindOne(user_id, { href })

        return fav && fav.destroy()
    }
}

export { DB }