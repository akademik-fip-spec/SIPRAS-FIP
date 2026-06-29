/**
 * Builds a standard success response.
 *
 * @param {string} message Response message.
 * @param {*} data Response payload.
 * @return {{success: boolean, message: string, data: *}} Standard response.
 */
function responseSuccess(message, data) {
  return {
    success: true,
    message: message || '',
    data: data === undefined ? {} : data
  };
}

/**
 * Builds a standard error response.
 *
 * @param {string} message Response message.
 * @param {*} error Error object or message.
 * @return {{success: boolean, message: string, error: string}} Standard response.
 */
function responseError(message, error) {
  return {
    success: false,
    message: message || '',
    error: error ? String(error.message || error) : ''
  };
}

/**
 * Response helper namespace.
 */
const ResponseHelper = {
  success: responseSuccess,
  error: responseError
};
