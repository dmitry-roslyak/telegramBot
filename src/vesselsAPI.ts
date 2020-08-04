import fetch from "node-fetch";
import { VesselsList, Vessel } from "./telegramBot.t";
const legacyURL = require("url");

const vesselAPI = {
  getOne: function (vesselHref: string): Promise<Vessel> {
    const url = legacyURL.format({
      pathname: process.env.vessel_API + "/view",
      query: { vesselHref },
    });

    return fetch(url)
      .then((res) => res.ok && res.json())
      .catch((err) => console.error(err));
  },
  find: function (text: string): Promise<Vessel | VesselsList> {
    const url = legacyURL.format({
      pathname: process.env.vessel_API + "/search/" + text,
    });

    return fetch(url)
      .then((res) => res.ok && res.json())
      .catch((err) => console.error(err));
  },
  imageFind: function (mmsi: string | number): Promise<string> {
    const url = legacyURL.format({
      pathname: process.env.vessel_API + "/imageFind/",
      query: { mmsi },
    });

    return fetch(url)
      .then((res) => (res.ok ? (res.text() as any) : null))
      .catch((err) => console.error(err));
  },
};

export default vesselAPI;
