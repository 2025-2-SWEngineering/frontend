import axios from "axios";
import { incrementLoading, decrementLoading } from "../state/globalLoading";

// 개발환경에서는 Vite 프록시('/api' → 3001)를 사용
// 배포환경에서는 VITE_API_URL이 설정되면 해당 값을 사용
// @ts-ignore
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - JWT 토큰 추가
api.interceptors.request.use(
  (config) => {
    try {
      incrementLoading();
    } catch {}
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 - 401 시 리프레시 토큰으로 재발급 후 재시도
let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function addSubscriber(callback: (token: string) => void) {
  subscribers.push(callback);
}

api.interceptors.response.use(
  (response) => {
    try {
      decrementLoading();
    } catch {}
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;
    try {
      decrementLoading();
    } catch {}
    if (status !== 401) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        addSubscriber((newToken) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    try {
      const { data } = await api.post<{ token: string; refreshToken: string }>("/auth/refresh", {
        refreshToken,
      });
      const newToken = data.token;
      const newRefresh = data.refreshToken;
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefresh);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      isRefreshing = false;
      onTokenRefreshed(newToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (e) {
      isRefreshing = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";
      return Promise.reject(e);
    }
  },
);

export default api;
