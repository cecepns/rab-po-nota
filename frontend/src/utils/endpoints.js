export const API_ENDPOINTS = {
  AUTH: { LOGIN: "/auth/login", REGISTER: "/auth/register", PROFILE: "/auth/profile" },
  USERS: { LIST: "/users", DETAIL: (id) => `/users/${id}` },
  SUPPLIERS: { LIST: "/suppliers", DETAIL: (id) => `/suppliers/${id}` },
  CUSTOMERS: { LIST: "/customers", DETAIL: (id) => `/customers/${id}` },
  RAB: { LIST: "/rab", DETAIL: (id) => `/rab/${id}` },
  PO: { LIST: "/pos", DETAIL: (id) => `/pos/${id}`, GENERATE: "/pos/generate" },
  NOTA: {
    LIST: "/notas",
    DETAIL: (id) => `/notas/${id}`,
    FULL: (id) => `/notas/${id}/detail`,
    GENERATE: "/notas/generate",
    ITEM: (id) => `/nota-items/${id}`,
  },
  REPORT: { SUMMARY: "/report/summary" },
};
