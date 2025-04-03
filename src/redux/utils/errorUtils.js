/**
 * Serializes error objects to ensure they are Redux-serializable
 * @param {Error|string|Array|Object} error - The error to serialize
 * @returns {string|null} - A serialized string representation of the error or null
 */
export const serializeError = (error) => {
  if (!error) return null;
  
  // If it's an Apollo error, extract the message
  if (error.message) {
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