export function successResponse(res, message, data = null) {
  res.status(200).json({
    status: 200,
    error: false,
    message,
    data,
  });
}

export function errorResponse(res, statusCode, message) {
  res.status(statusCode).json({
    status: statusCode,
    message,
    error: true,
    data: null,
  });
}
