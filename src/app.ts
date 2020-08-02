if (typeof Promise.prototype.finally !== "function") {
  // eslint-disable-next-line no-extend-native
  Promise.prototype.finally = function (cb) {
    return Promise.race([this]).then(() => cb());
  };
}

require("./telegramBot");
