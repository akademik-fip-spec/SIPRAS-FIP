/**
 * Checks whether a value is empty.
 *
 * @param {*} value Value to inspect.
 * @return {boolean} True when value is empty.
 */
function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Validates required fields.
 *
 * @param {Object} data Payload to validate.
 * @param {string[]} fields Required field names.
 * @return {string[]} Validation errors.
 */
function validateRequired(data, fields) {
  try {
    return fields.filter(function (field) {
      return isBlank(data[field]);
    }).map(function (field) {
      return field + ' wajib diisi.';
    });
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Validates that a value exists in an allowed list.
 *
 * @param {*} value Value to validate.
 * @param {*[]} allowedValues Allowed values.
 * @param {string} fieldLabel Field label.
 * @return {?string} Validation message.
 */
function validateInList(value, allowedValues, fieldLabel) {
  try {
    return allowedValues.indexOf(value) === -1 ? fieldLabel + ' tidak valid.' : null;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Validation helper namespace.
 */
const ValidationHelper = {
  isBlank: isBlank,
  required: validateRequired,
  inList: validateInList
};
