import { Query, Favorite } from "./models";
import { VesselProperty, Vessel } from "./telegramBot.t";
import { Op } from "sequelize";

class DB {
    chat_id: number
    constructor(chat_id: number) {
        this.chat_id = chat_id
    }
    queryfindOne(message_id: number) {
        return Query.findOne({
            where: {
                chat_id: this.chat_id,
                message_id
            }
        })
    }
    queryCreate(message: any, data: any) {
        let message_id = message.result.message_id
        return Query.create({
            message_id,
            chat_id: this.chat_id,
            data: JSON.stringify(data),
        })
    }
    favoriteFindOne(data: Vessel) {
        return Favorite.findOne({
            where: {
                [Op.and]: { user_id: this.chat_id },
                [Op.or]: [{ href: data[VesselProperty.href] }],
                // [Op.or]: [{ { mmsi: data[VesselProperty.MMSI] }, { name: data[VesselProperty.name], country: data[VesselProperty.flag] }],
            }
        })
    }
    async favoriteFindOneOrCreate(data: any, href: string) {
        let fav = await this.favoriteFindOne(data)

        return fav || Favorite.create({
            user_id: this.chat_id,
            name: data[VesselProperty.name],
            country: data[VesselProperty.flag],
            href
        })
    }
    favorites() {
        return Favorite.findAll({ where: { user_id: this.chat_id } })
    }
    async favoriteRemove(href: string) {
        let fav = await this.favoriteFindOne({ href })

        return fav && fav.destroy()
    }
}

export { DB }