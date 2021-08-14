const steamUser = require("steam-user");
const propertiesReader = require("properties-reader");
const Logger = require("js-logger");
Logger.useDefaults();

try {
  Logger.info("Reading properties file ...");
  const propsReader = propertiesReader("./props.properties");
  const steam = new steamUser();
  Logger.info("Verifying Contents ...");

  const props = propsReader.getAllProperties();

  if (!("accountName" in props)) {
    throw Error(
      "Verification Error: 'accountName' not found in properties file."
    );
  }
  if (!("password" in props)) {
    throw Error("Verification Error: 'password' not found in properties file.");
  }
  if (!("games" in props)) {
    throw Error("Verification Error: 'games' not found in properties file.");
  }
  if (!("guardCode" in props)) {
    throw Error(
      "Verification Error: 'guardCode' not found in properties file."
    );
  }

  steam.logOn({
    accountName: props.accountName,
    password: props.password,
    rememberPassword: true,
    twoFactorCode: props.guardCode,
    dontRememberMachine: false,
  });

  const games = ("" + props.games).split(",").flatMap((x) => Number(x));

  if (games.length === 0) {
    throw Error(
      "Verification Error: No 'games' found in props, make sure the list of games are separated by commas"
    );
  }

  steam.on("loggedOn", () => {
    console.log("user logged in");
    steam.setPersona(steamUser.EPersonaState.Online);
    steam.gamesPlayed(games);
    console.log("Started Boosting...");
  });
} catch (error) {
  if (
    typeof error.message === "string" &&
    error.message.includes(".properties")
  ) {
    Logger.error("Error Reading properties file.");
    Logger.info("Creating the template file...");
    const fs = require("fs");
    fs.writeFileSync(
      "./props.properties",
      "accountName=<Your-Username>\npassword=<Your-Password>\ngames=730,440\nguardCode=<Fresh Steam Guard>"
    );
    Logger.info("Template file file created.");
  } else if (
    typeof error.message === "string" &&
    error.message.includes("Verification Error")
  ) {
    Logger.error("Error with properties file content.");
  } else {
    Logger.error("Unknown Error.");
  }
}
