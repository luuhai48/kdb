export function InternalServerError(msg) {
  return {
    error: msg || 'Internal Server Error',
    code: 500,
  };
}

export function BadRequest(msg) {
  return {
    error: msg || 'Bad Request',
    code: 400,
  };
}

export function Forbidden(msg) {
  return {
    error: msg || 'Forbidden',
    code: 403,
  };
}
