export const ADMIN_STORAGE_KEY = 'edu-book-admin-auth';
export const ADMIN_USERNAME = 'Edubookkids31200';
export const ADMIN_PASSWORD = 'edu31200';

export function isValidAdminCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function getAdminAuthorizationHeader() {
  const credentials = btoa(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`);
  return `Admin ${credentials}`;
}