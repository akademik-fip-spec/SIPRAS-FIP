/**
 * Gets the configured Google Drive folder for inspection photos.
 *
 * @return {GoogleAppsScript.Drive.Folder} Inspection photo folder.
 */
function getInspectionPhotoFolder() {
  try {
    const folderId = Config.DRIVE && Config.DRIVE.INSPECTION_PHOTO_FOLDER_ID;

    if (ValidationHelper.isBlank(folderId)) {
      throw new Error('Folder foto pemeriksaan belum dikonfigurasi.');
    }

    return DriveApp.getFolderById(folderId);
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Uploads an inspection photo to Google Drive.
 *
 * @param {{fileName: string, mimeType: string, base64: string}} fileData Photo payload.
 * @return {{fileId: string, url: string}} Uploaded file metadata.
 */
function uploadInspectionPhoto(fileData) {
  try {
    if (!fileData || ValidationHelper.isBlank(fileData.base64)) {
      throw new Error('File foto tidak tersedia.');
    }

    const folder = getInspectionPhotoFolder();
    const fileName = String(fileData.fileName || 'foto-pemeriksaan').trim();
    const mimeType = String(fileData.mimeType || 'application/octet-stream').trim();
    const content = String(fileData.base64).replace(/^data:[^;]+;base64,/, '');
    const blob = Utilities.newBlob(Utilities.base64Decode(content), mimeType, fileName);
    const file = folder.createFile(blob);

    return {
      fileId: file.getId(),
      url: getFileUrl(file.getId())
    };
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Deletes an inspection photo from Google Drive.
 *
 * @param {string} fileIdOrUrl Drive file id or URL.
 * @return {boolean} True when delete request completed.
 */
function deleteInspectionPhoto(fileIdOrUrl) {
  try {
    const fileId = extractDriveFileId(fileIdOrUrl);

    if (ValidationHelper.isBlank(fileId)) {
      return false;
    }

    DriveApp.getFileById(fileId).setTrashed(true);
    return true;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Gets a Google Drive file URL by id.
 *
 * @param {string} fileId Drive file id.
 * @return {string} File URL.
 */
function getFileUrl(fileId) {
  try {
    if (ValidationHelper.isBlank(fileId)) {
      return '';
    }

    return DriveApp.getFileById(fileId).getUrl();
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Extracts a Drive file id from a file id or URL.
 *
 * @param {string} fileIdOrUrl Drive file id or URL.
 * @return {string} File id.
 */
function extractDriveFileId(fileIdOrUrl) {
  const value = String(fileIdOrUrl || '').trim();

  if (ValidationHelper.isBlank(value)) {
    return '';
  }

  const match = value.match(/\/d\/([^/]+)/) || value.match(/[?&]id=([^&]+)/);
  return match ? match[1] : value;
}

/**
 * Drive helper namespace.
 */
const DriveHelper = {
  uploadInspectionPhoto: uploadInspectionPhoto,
  deleteInspectionPhoto: deleteInspectionPhoto,
  getFileUrl: getFileUrl
};
