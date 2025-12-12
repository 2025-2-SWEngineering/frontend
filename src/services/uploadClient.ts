import axios from "axios";
import { incrementLoading, decrementLoading } from "../state/globalLoading";

// Axios 인스턴스: 외부(예: S3 presigned URL) 업로드 전용
// - baseURL 없음
// - Authorization 헤더 주입 없음
// - 전역 로딩 카운터 연동

const uploadClient = axios.create();

uploadClient.interceptors.request.use(
  (config) => {
    try {
      incrementLoading();
    } catch {
      void 0;
    }
    return config;
  },
  (error) => {
    try {
      decrementLoading();
    } catch {
      void 0;
    }
    return Promise.reject(error);
  },
);

uploadClient.interceptors.response.use(
  (response) => {
    try {
      decrementLoading();
    } catch {
      void 0;
    }
    return response;
  },
  (error) => {
    try {
      decrementLoading();
    } catch {
      void 0;
    }
    return Promise.reject(error);
  },
);

export default uploadClient;
