export interface Vessel {
    [property: string]: string | any;
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
    name = "Name",
    shipType = "Type",
    flag = "Flag",
    IMO = "IMO",
    MMSI = "MMSI",
    callsign = "Call Sign",
    builtYear = "builtYear",
    size = "Size",
    // length = "length",
    // beam = "beam",
    GRT = "GRT",
    DWT = "DWT",
    currentDraught = "Draught",
    course = "Course",
    speed = "Speed",
    status = "Status",
    area = "Area",
    port = "Port",
    lastPort = "Last Port",
    destination = "Destination",
    estimatedArrivalDate = "ETA",
    lastReportDate = "updatedAt",
    coordinates = "Coordinates",
    href = "href"
}

export const VesselMeasurementSystem = {
    [VesselProperty.GRT + ""]: "t",
    [VesselProperty.DWT + ""]: "t",
    [VesselProperty.speed + ""]: "kn",
    [VesselProperty.size + ""]: "m",
    [VesselProperty.currentDraught + ""]: "m",
}

export const VesselPropertyArray = [
    VesselProperty.name,
    VesselProperty.shipType,
    VesselProperty.flag,
    VesselProperty.IMO,
    VesselProperty.MMSI,
    VesselProperty.callsign,
    VesselProperty.builtYear,
    VesselProperty.size,
    // VesselProperty.length,
    // VesselProperty.beam,
    VesselProperty.GRT,
    VesselProperty.DWT,
    VesselProperty.status,
    VesselProperty.speed,
    VesselProperty.course,
    VesselProperty.currentDraught,
    VesselProperty.area,
    VesselProperty.port,
    VesselProperty.lastPort,
    VesselProperty.destination,
    VesselProperty.estimatedArrivalDate,
    VesselProperty.lastReportDate
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
    favEmpty = "vesselFavoritesEmpty",
    favRemove = "vesselRemoveFromFavorites"
}