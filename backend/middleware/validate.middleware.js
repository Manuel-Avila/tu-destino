export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const parsedBody = schema.parse(req.body);
      req.body = parsedBody;
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const errors = {};
        err.errors.forEach((e) => {
          if (e.path.length > 0) {
            errors[e.path[0]] = e.message;
          }
        });
        return res.status(400).json({ errors });
      }
      return res.status(500).json({ error: 'Error interno de validacin.' });
    }
  };
};
