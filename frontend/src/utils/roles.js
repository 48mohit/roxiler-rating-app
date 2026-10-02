export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  STORE_OWNER: 'STORE_OWNER',
};

// Where each role lands after login.
export const homePathForRole = (role) => {
  const paths = {
    ADMIN: '/admin',
    USER: '/stores',
    STORE_OWNER: '/owner',
  };
  return paths[role] || '/login';
};