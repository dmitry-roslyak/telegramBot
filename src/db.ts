import { Query, Favorite } from "./models";
import { VesselProperty, Vessel } from "./telegramBot.t";
import { Op } from "sequelize";

class DB {
  static queryfindOne(chat_id: number, message_id: number): Promise<Query | void> {
    return Query.findOne({
      where: {
        chat_id,
        message_id,
      },
    }).catch((err) => console.error(err));
  }

  static queryCreate(chat_id: number, message_id: number, data: unknown): Promise<Query | void> {
    return Query.create({
      message_id,
      chat_id,
      data: JSON.stringify(data),
    }).catch((err) => console.error(err));
  }

  static favoriteFindOne(user_id: number, data: Vessel): Promise<Favorite | void> {
    return Favorite.findOne({
      where: {
        [Op.and]: { user_id },
        [Op.or]: [{ mmsi: data[VesselProperty.MMSI] }, { href: data[VesselProperty.href] }],
      },
    }).catch((err) => console.error(err));
  }

  static async favoriteFindOneOrCreate(user_id: number, data: Vessel): Promise<Favorite | void> {
    const fav = await this.favoriteFindOne(user_id, data);

    return (
      fav ||
      Favorite.create({
        user_id,
        mmsi: data[VesselProperty.MMSI],
        name: data[VesselProperty.name],
        country: data[VesselProperty.flag],
        href: data[VesselProperty.href],
      }).catch((err) => console.error(err))
    );
  }

  static favorites(user_id: number): Promise<Favorite[]> {
    return Favorite.findAll({ where: { user_id } }).catch((err) => {
      console.error(err);
      return [];
    });
  }

  static async favoriteRemove(user_id: number, data: Vessel): Promise<void> {
    const fav = await this.favoriteFindOne(user_id, data);

    return fav && fav.destroy().catch((err) => console.error(err));
  }
}

export { DB };
