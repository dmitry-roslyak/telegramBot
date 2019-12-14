if (typeof Promise.prototype.finally !== "function") Promise.prototype.finally = function (cb) {
    return Promise.race([this]).then(() => cb())
}

require("./telegramBot")