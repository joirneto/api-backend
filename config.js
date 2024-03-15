const { client } = require("./knexfile");

module.exports = {
  mysql: {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    debug: process.env.DEBUG === "true",
  },
  tokenVercelBlob: process.env.TOKEN_VERCEL_BLOB,
  diretoryImagensActivity: '/www/imagens/activity/',
  urlBaseDiretoryImagensActivity: 'www.suaURL.com/imagens/activity/',
  tableActivities: "Activities",
  tableUsers: "Users",
  tableAuth: "Auth",
  tablePictures: "Pictures",
  secret: process.env.SECRET,
  folderId: process.env.FOLDER_ID,
  urlDownloadGoogleApis: process.env.URL_DOWNLOAD_GOOGLE_APIS,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL
};
