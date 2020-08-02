import { Query, Favorite } from "./models";
import { VesselProperty, Vessel } from "./telegramBot.t";
import { Op } from "sequelize";

class DB {
  static queryfindOne(chat_id: number, message_id: number): Promise<Query> {
    return Query.findOne({
      where: {
        chat_id,
        message_id,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static queryCreate(chat_id: number, message_id: number, data: any): Promise<Query> {
    return Query.create({
      message_id,
      chat_id,
      data: JSON.stringify(data),
    });
  }

  static favoriteFindOne(user_id: number, data: Vessel): Promise<Favorite> {
    return Favorite.findOne({
      where: {
        [Op.and]: { user_id },
        [Op.or]: [{ mmsi: data[VesselProperty.MMSI] }, { href: data[VesselProperty.href] }],
      },
    });
  }

  static async favoriteFindOneOrCreate(user_id: number, data: Vessel, href: string): Promise<Favorite> {
    const fav = await this.favoriteFindOne(user_id, data);

    return (
      fav ||
      Favorite.create({
        user_id,
        mmsi: data[VesselProperty.MMSI],
        name: data[VesselProperty.name],
        country: data[VesselProperty.flag],
        href,
      })
    );
  }

  static favorites(user_id: number): Promise<Favorite[]> {
    return Favorite.findAll({ where: { user_id } });
  }

  static async favoriteRemove(user_id: number, href: string): Promise<void> {
    const fav = await this.favoriteFindOne(user_id, { href });

    return fav && fav.destroy();
  }
}

export { DB };
