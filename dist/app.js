if (process.env.NODE_ENV != "production") {
    const { telegram, vesselApi, sequelizeConfig } = require("../env.json");
    process.env.DATABASE_URL =
        `postgres://${sequelizeConfig.username}:${sequelizeConfig.password}@${sequelizeConfig.options.host}/${sequelizeConfig.database}`;
    process.env.telegram_API_URL = telegram.apiUrl;
    process.env.telegram_API_Key = telegram.apiKey;
    process.env.telegram_Contact_URL = telegram.contactURL;
    process.env.vessel_API = vesselApi;
}
require("./telegramBot");
//# sourceMappingURL=app.js.map