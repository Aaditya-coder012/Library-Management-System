export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
export const BASE = API_BASE ? (API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`) : "/api";

function getToken() {
  return localStorage.getItem("lms_token") || "";
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  // auth
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request("/auth/me"),

  // books
  getBooks: (params = {}) => request(`/books?${new URLSearchParams(params)}`),
  createBook: (body) => request("/books", { method: "POST", body: JSON.stringify(body) }),
  updateBook: (id, body) => request(`/books/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),

  // members
  getMembers: (params = {}) => request(`/members?${new URLSearchParams(params)}`),
  createMember: (body) => request("/members", { method: "POST", body: JSON.stringify(body) }),
  deleteMember: (id) => request(`/members/${id}`, { method: "DELETE" }),

  // transactions
  getTransactions: (params = {}) => request(`/transactions?${new URLSearchParams(params)}`),
  issueBook: (body) => request("/transactions/issue", { method: "POST", body: JSON.stringify(body) }),
  returnBook: (body) => request("/transactions/return", { method: "POST", body: JSON.stringify(body) }),
  payFine: (id) => request(`/transactions/${id}/pay-fine`, { method: "POST" }),

  // dashboard
  getStats: () => request("/dashboard/stats"),
  getAnalytics: () => request("/dashboard/analytics"),
  getFines: () => request("/dashboard/fines"),
};
