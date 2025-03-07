import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useTokenStore } from '@/stores/token.js';
import router from '@/api/router'

const baseURL = '/api';

const instance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json' // 设置默认的Content-Type为application/json
    }
});

instance.interceptors.request.use(
    (config) => {
        const tokenStore = useTokenStore();
        if (tokenStore.token) {
            config.headers.Authorization = `Bearer ${tokenStore.token}`;
        }
        return config;
    },
    (err) => {
        return Promise.reject(err);
    }
);

instance.interceptors.request.use(
    config => {
        // console.log('Request Headers:', config.headers); // 打印请求头
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    response => {
        const result = response.data;
        if (result.code === 0) {
            return result;
        } else {
            ElMessage.error(result.message ? result.message : "这里服务异常");
            router.push('/login');
            return Promise.reject(result);
        }
    },
    error => {
        if (error.response.status === 401) {
            ElMessage.error('请先登录', error.message);
            router.push('/login');
        } else {
            ElMessage.error("服务异常");
        }
        
        return Promise.reject(error);
    }
);

export default instance;