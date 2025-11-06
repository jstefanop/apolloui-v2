/**
 * Serializes error objects to ensure they are Redux-serializable
 * @param {Error|string|Array|Object} error - The error to serialize
 * @returns {string|Object|null} - A serialized representation of the error or null
 */
export const serializeError = (error) => {
  if (!error) return null;
  
  // If error has data.error structure (RPC errors), preserve it as an object
  if (error.data?.error) {
    return {
      message: error.data.error.message || error.message || 'Unknown error',
      code: error.data.error.code || error.code,
      data: {
        error: {
          message: error.data.error.message,
          code: error.data.error.code,
        },
      },
      ...(error.status && { status: error.status }),
      ...(error.statusText && { statusText: error.statusText }),
    };
  }
  
  // If it's an Apollo error, extract the message
  if (error.message) {
    // If it's already a plain object with message, return it as is
    if (typeof error === 'object' && !(error instanceof Error)) {
      return {
        message: error.message,
        ...(error.code && { code: error.code }),
        ...(error.type && { type: error.type }),
      };
    }
    return error.message;
  }
  
  // If it's a GraphQL error array, extract messages
  if (Array.isArray(error)) {
    return error.map(err => err.message || err).join(', ');
  }
  
  // For other error types, convert to string
  return String(error);
};

/**
 * Checks if an error is an authentication error
 * @param {Error|Object} error - The error to check
 * @returns {boolean} - True if the error is an authentication error
 */
export const isAuthError = (error) => {
  if (!error) return false;
  
  // Check for GraphQL errors
  if (error.graphQLErrors) {
    return error.graphQLErrors.some(
      (err) => err.message && err.message.includes('authenticated')
    );
  }
  
  // Check for network errors
  if (error.networkError) {
    return error.networkError.message && 
           error.networkError.message.includes('authenticated');
  }
  
  // Check for message directly
  if (error.message) {
    return error.message.includes('authenticated');
  }
  
  return false;
}; 