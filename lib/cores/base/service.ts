import axios from "axios";

export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_BASE_URL });

api.interceptors.request.use((config) => {
  const publicRoutes = ["/auth/login", "/auth/register"];
  const isPublic = publicRoutes.some((route) => config.url?.includes(route));

  if (!isPublic && typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
