import request from "@/utils/request.js";

export const userRegisterService = (registerData) => {
    return request.post('/register', { ...registerData });
};

export const userLoginService = (loginData) => {
    return request.post('/login', { ...loginData });
};

export const changePasswordService = (changePasswordData) => {
    const { name, oldPassword, newPassword } = changePasswordData;
    return request.post('/changePassword', { name, oldPassword, newPassword });
};

export const sendVerificationCodeService = (data) => {
    return request.post('/email/sendVerificationCode', data);
};

export const updatePasswordByEmailService = (data) => {
    return request.post('/updatePasswordByEmail', data);
};