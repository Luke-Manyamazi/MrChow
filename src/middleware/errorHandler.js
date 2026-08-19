export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function requireRole(...roles) {
  return (request, response, next) => {
    const role = request.header('x-user-role');
    if (!roles.includes(role)) {
      return next(new AppError('A permitted user role is required', 403));
    }
    request.userRole = role;
    return next();
  };
}

export function notFoundHandler(request, response) {
  response.status(404).json({ error: `Route not found: ${request.method} ${request.originalUrl}` });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || (error.code === 'P2025' ? 404 : 500);
  const message = statusCode >= 500 ? 'Internal server error' : error.message;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({ error: message });
}
