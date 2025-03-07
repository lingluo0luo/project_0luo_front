import request from '@/utils/request.js';
// import { useTokenStore } from '@/stores/token.js';
export const articleCategoryListService = () => {
    return request.get('/category');
};

export const articleCategoryAddService = (categoryData) => {
    return request.post('/category', categoryData);
};  
export const articleCategoryUpdateService = (categoryData) => {
    return request.put('/category/update', categoryData);
};
export const articleCategoryDeleteService = (id) => {
    return request.delete('/category/'+id);
};
export const ifToken = (token) => {
    return request.post('/ifToken',token);
}