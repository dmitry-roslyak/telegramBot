import fetch from "node-fetch";
import { VesselsList, Vessel } from "./telegramBot.t";
const legacyURL = require("url");

const vesselAPI = {
  getOne: function (key: string, value: string): Promise<Vessel> {
    const url = legacyURL.format({
      pathname: process.env.vessel_API + "/vessel",
      query: { [key]: value },
    });

    return fetch(url)
      .then((res) => res.ok && res.json())
      .catch((err) => console.error(err));
  },
  find: function (name: string): Promise<VesselsList> {
    const url = legacyURL.format({
      pathname: process.env.vessel_API + "/vessel",
      query: { name },
    });

    return fetch(url)
      .then((res) => res.ok && res.json())
      .catch((err) => console.error(err));
  },
  imageFind: function (mmsi: string | number): Promise<string> {
    const url = legacyURL.format({
      pathname: process.env.vessel_API + "/photo",
      query: { mmsi },
    });

    return fetch(url)
      .then((res) => (res.ok ? (res.text() as any) : null))
      .catch((err) => console.error(err));
  },
};

export default vesselAPI;
