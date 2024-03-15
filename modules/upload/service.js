const { put, del } = require("@vercel/blob");
const config = require("../../config");
const ActivitiesService = require("../activities/service");
const UploadRepository = require("./repository");
const {google} = require('googleapis');
const { Readable } = require('node:stream');
const { default: axios } = require("axios");

class UploadService {
  static config() {
    return new UploadService(
      ActivitiesService.config(),
      UploadRepository.config(),
      );
  }

  async uploadFile(id, file) {
    const folderId = config.folderId;
    const client_email = config.client_email;
    const private_key = config.private_key;

    const activity = await this.activitiesService.retrieve(id);
    if (!activity) throw new Error("Activity not found");


    if (!file) throw new Error("File not found");

    const {buffer} = file;
    const originalname = file.originalname;
    const transformName = `activity_${id}-${Date.now()}-${originalname}`;

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          "private_key": private_key,
          "client_email": client_email,
        },
        scopes: ['https://www.googleapis.com/auth/drive']
      });

      const driveService = google.drive({
        version: 'v3',
        auth
      });
      
      const fileMetaData = {
        'name': transformName,
        'parents': [folderId]
      }

      const media = {
        mimeType: file.mimetype,
        body: Readable.from(buffer)
      }

      const response = await driveService.files.create({
        resource: fileMetaData,
        media,
        fields: 'id'
      })

      const novoId = await getViewIdFromImageIdGoogleDrive(response.data.id)
      const url = `${config.urlDownloadGoogleApis}${novoId}`;
      await this.uploadRepository.create({id: response.data.id, url: url, activity_id: id});
      return url
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    } 
  }

  async deleteFile(id) {
    const picture = await this.uploadRepository.retrieve(id);
    if (!picture) throw new Error("Picture not found");

    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json',
        scopes: ['https://www.googleapis.com/auth/drive']
      });

      const driveService = google.drive({
        version: 'v3',
        auth
      });
      
      driveService.files.delete({ fileId: id }, (err, res) => {
        if (err) {
          console.error('Erro ao excluir o arquivo:', err);
        } else {
          console.log('Arquivo excluído com sucesso!');
        }
      });
      await this.uploadRepository.delete(id);
      console.log("Arquivo deletado do banco de dados!");
    } catch (error) {
      console.error("Erro ao deletar arquivo do server:", error);
    }
  }

  constructor(activitiesService, uploadRepository) {
    this.activitiesService = activitiesService;
    this.uploadRepository = uploadRepository;
  }
}

const getViewerIdFromHTMLSourceCode = sourceCode => {
  if (!sourceCode) return null
  const splited = sourceCode.split('drive-viewer/')
  if (splited.length < 2) return null
  const viewerId = splited[1].split('\\')[0]
  return viewerId
}

const getViewIdFromImageIdGoogleDrive = async photo_id => {
  try {
      const fetch = await axios.get(`https://drive.google.com/file/d/${photo_id}/view`)
      const viewid = getViewerIdFromHTMLSourceCode(fetch.data)
      return viewid
  } catch (err) {
      return null;
  }
}

module.exports = UploadService;
