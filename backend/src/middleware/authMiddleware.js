export const authMiddleware = (req, res, next) => {
  // mock ไปก่อน
  req.user = { id: 1 };

  next();
};