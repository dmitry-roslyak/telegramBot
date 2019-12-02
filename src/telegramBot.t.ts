export interface Vessel {
    [property: string]: string;
}
interface VesselsListItem {
    href: string;
    name: string;
    country: string;
}
export interface VesselsList extends Array<VesselsListItem> {
}
export enum CallbackQueryActions {
    href = "href",
    location = "location",
    favoritesAdd = "favoritesAdd",
    favoritesRemove = "favoritesRemove",
    search = "search",
    contact = "contact",
    favorites = "favorites",
    photo = "photo"
}
export enum VesselProperty {
    name = "name",
    shipType = "Ship type",
    flag = "Flag",
    IMO = "IMO",
    MMSI = "MMSI",
    callsign = "Callsign",
    builtYear = "Year of Built",
    length = "length",
    beam = "beam",
    grossTonnage = "Gross Tonnage",
    deadweight = "Summer Deadweight (t)",
    currentDraught = "Current draught",
    course = "course",
    speed = "speed",
    destination = "Destination",
    estimatedArrivalDate = "ETA",
    lastReportDate = "Last report ",
    coordinates = "Coordinates",
    href = "href"
}

export enum VesselMetricSystem {
    length = "m",
    currentDraught = "m",
    beam = "m",
    speed = "kn",
    grossTonnage = 't',
    deadweight = 't'
}

export const VesselPropertyArray = [
    "name", VesselProperty.name,
    "shipType", VesselProperty.shipType,
    "flag", VesselProperty.flag,
    "IMO", VesselProperty.IMO,
    "MMSI", VesselProperty.MMSI,
    "callsign", VesselProperty.callsign,
    "builtYear", VesselProperty.builtYear,
    "length", VesselProperty.length,
    "beam", VesselProperty.beam,
    "grossTonnage", VesselProperty.grossTonnage,
    "deadweight", VesselProperty.deadweight,
    "currentDraught", VesselProperty.currentDraught,
    "course", VesselProperty.course,
    "speed", VesselProperty.speed,
    "destination", VesselProperty.destination,
    "estimatedArrivalDate", VesselProperty.estimatedArrivalDate,
    "lastReportDate", VesselProperty.lastReportDate
];

export enum UI_template {
    queryIsTooOld = "queryIsTooOld",
    photoNotAvailable = "photoNotAvailable",
    errorTrylater = "errorTrylater",
    hello = "hello",
    menu = "menu",
    vesselInfo = "vesselInfo",
    vesselList = "vesselList",
    vesselListFav = "vesselListFav",
    favAdd = "vesselAddToFavorites",
    favEmpty = "vesselFavoritesEmpty"
}