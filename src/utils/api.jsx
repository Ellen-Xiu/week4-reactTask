import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const api = axios.create({
  baseURL: `${API_BASE}`,
});

export const fetchProducts = (page = 1) => {
  return api.get(`/api/${API_PATH}/admin/products?page=${page}`);
}

//設定tokon
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = token;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export const checkLoginApi = () => {
  return api.post(`/api/user/check`);
}

//modal 處理產品相關api
//更新產品
export const updateProductApi = (id, data) => {
  return api.put(`/api/${API_PATH}/admin/product/${id}`, data)
}
//建立新產品
export const createProductApi = (data) => {
  return api.post(`/api/${API_PATH}/admin/product`, data)
}
//刪除產品
export const delProductApi = (id) =>{
  return api.delete(`/api/${API_PATH}/admin/product/${id}`);
}
//上傳圖片
export const uploadImgApi = (formData) =>{
  return api.post(`/api/${API_PATH}/admin/upload`, formData);
}