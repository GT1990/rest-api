/**
 * EXPORTS: asyncHandler()
 * @param {function} cb
 * @returns {function} - returns middleware function with try and catch block wrapping the callback function
 */
exports.asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
