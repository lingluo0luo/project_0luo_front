#file:c:\Users\0luo\Desktop\前端\bing-event\src\views\Login.vue
Login.vue
<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userRegisterService, userLoginService, sendVerificationCodeService, updatePasswordByEmailService } from '@/api/user.js'
import { useTokenStore } from '@/stores/token.js';
import { useRouter } from 'vue-router'

const isRegister = ref(false)
const showForgotPassword = ref(false)
const registerData = ref({
    age: "",
    name: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    rePassword: ""
})
const forgotPasswordData = ref({
    email: "",
    authorizationCode: "", // 新增授权码字段
    verificationCode: "",
    newPassword: ""
})

const checkRePassword = (rule, value, callback) => {
    if (value === "") {
        callback(new Error("两次密码不一致"))
    } else if (value !== registerData.value.password) {
        callback(new Error("两次密码不一致"))
    }
    callback()
}

const rules = {
    age: [
        { required: true, message: "请输入年龄", trigger: "blur" },
        { min: 1, max: 3, message: "长度为1-3位非空字符", trigger: "change" }
    ],
    name: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 3, max: 16, message: "长度为5-16位非空字符", trigger: "change" }
    ],
    gender: [
        { required: true, message: "请输入性别", trigger: "blur" },
        { min: 1, max: 2, message: "长度为1-2位非空字符", trigger: "change" }
    ],
    address: [
        { required: true, message: "请输入地址", trigger: "blur" },
        { min: 5, max: 16, message: "长度为5-16位非空字符", trigger: "change" }
    ],
    phone: [
        { required: true, message: "请输入电话", trigger: "blur" },
        { min: 11, max: 11, message: "长度为11位非空字符", trigger: "change" }
    ],
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { min: 5, max: 16, message: "长度为5-16位非空字符", trigger: "change" }
    ],
    password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 5, max: 16, message: "长度为5-16位非空字符", trigger: "change" }
    ],
    rePassword: [
        { validator: checkRePassword, trigger: "blur" }
    ]
}

const forgotPasswordRules = {
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: 'email', message: "请输入正确的邮箱地址", trigger: "change" }
    ],
    authorizationCode: [ // 新增授权码验证规则
        { required: true, message: "请输入授权码", trigger: "blur" },
        { min: 16, max: 16, message: "授权码长度为16位", trigger: "change" }
    ],
    verificationCode: [
        { required: true, message: "请输入验证码", trigger: "blur" },
        { len: 6, message: "验证码长度为6位", trigger: "change" }
    ],
    newPassword: [
        { required: true, message: "请输入新密码", trigger: "blur" },
        { min: 5, max: 16, message: "长度为5-16位非空字符", trigger: "change" }
    ]
}

const rememberMe = ref(false);

const register = async () => {
    let result = await userRegisterService(registerData.value)
    console.log(result);
    ElMessage.success(result.message ? result.message : "注册成功")
}

const router = useRouter()
const tokenStore = useTokenStore()

const login = async () => {
    let result = await userLoginService(registerData.value);
    ElMessage.success(result.message ? "登录成功" : "登录失败");
    tokenStore.setToken(result.data);

    if (rememberMe.value) {
        localStorage.setItem('username', registerData.value.name);
        localStorage.setItem('password', registerData.value.password);
    }

    router.push("/");
}

const verificationCode = ref('');
const verificationCodeSent = ref(false);

const sendVerificationCode = async () => {
    if (!forgotPasswordData.value.email || !forgotPasswordData.value.authorizationCode) {
        ElMessage.error("请输入邮箱和授权码");
        return;
    }

    // 生成六位数的验证码
    verificationCode.value = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated verification code:", verificationCode.value);

    // 调用后端接口发送验证码
    try {
        const response = await sendVerificationCodeService({
            email: forgotPasswordData.value.email,
            authorizationCode: forgotPasswordData.value.authorizationCode,
            verificationCode: verificationCode.value
        });
        console.log(response);

        // 检查响应状态码或消息
        if (response.code === 0) {

            console.log("Verification code sent successfully");

            ElMessage.success(response.message ? response.message : "验证码已发送");
            verificationCodeSent.value = true;
        } else {
            console.error("Error sending verification code:", response.message);
            ElMessage.error(response.message ? response.message : "验证码发送失败，请重试");
        }
    } catch (error) {
        console.error("Error sending verification code:", error);
        ElMessage.error("验证码发送失败，请重试1");
        console.log(response.status);
    }
}

const resetPassword = async () => {
    if (forgotPasswordData.value.verificationCode !== verificationCode.value) {
        ElMessage.error("验证码错误3");
        return;
    }

    try {
        const result = await updatePasswordByEmailService({
            email: forgotPasswordData.value.email,
            newPassword: forgotPasswordData.value.newPassword
        });
        ElMessage.success(result.message ? result.message : "密码修改成功");
        showForgotPassword.value = false;
    } catch (error) {
        ElMessage.error("密码修改失败，请重试");
    }
}

onMounted(() => {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    if (savedUsername && savedPassword) {
        registerData.value.name = savedUsername;
        registerData.value.password = savedPassword;
        rememberMe.value = true;
    }
});
</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <!-- 注册表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :model="registerData" :rules="rules">
                <el-form-item>
                    <h1>注册</h1>
                </el-form-item>
                <el-form-item prop="age">
                    <el-input :prefix-icon="User" placeholder="请输入年龄" v-model="registerData.age"></el-input>
                </el-form-item>
                <el-form-item prop="name">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registerData.name"></el-input>
                </el-form-item>
                <el-form-item prop="gender">
                    <el-input :prefix-icon="User" placeholder="请输入性别" v-model="registerData.gender"></el-input>
                </el-form-item>
                <el-form-item prop="address">
                    <el-input :prefix-icon="User" placeholder="请输入地址" v-model="registerData.address"></el-input>
                </el-form-item>
                <el-form-item prop="phone">
                    <el-input :prefix-icon="User" placeholder="请输入电话" v-model="registerData.phone"></el-input>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input :prefix-icon="User" placeholder="请输入邮箱" v-model="registerData.email"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input :prefix-icon="Lock" type="password" placeholder="请输入密码"
                        v-model="registerData.password"></el-input>
                </el-form-item>
                <el-form-item prop="rePassword">
                    <el-input :prefix-icon="Lock" type="password" placeholder="请输入再次密码"
                        v-model="registerData.rePassword"></el-input>
                </el-form-item>
                <!-- 注册按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="register">
                        注册
                    </el-button>
                </el-form-item>
                <el-form-item class=" flex">
                    <el-link type="info" :underline="false" @click="isRegister = false">
                        ← 返回
                    </el-link>
                </el-form-item>
            </el-form>
            <!-- 登录表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-else-if="!showForgotPassword" :model="registerData"
                :rules="rules">
                <el-form-item>
                    <h1>登录</h1>
                </el-form-item>
                <el-form-item prop="name">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registerData.name"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码"
                        v-model="registerData.password"></el-input>
                </el-form-item>
                <el-form-item class="flex">
                    <div class="flex">
                        <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                        <el-link type="primary" :underline="false" @click="showForgotPassword = true">忘记密码？</el-link>
                    </div>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="isRegister = true">
                        注册 →
                    </el-link>
                </el-form-item>
            </el-form>
            <!-- 忘记密码表单 -->
            <el-form ref="forgotForm" size="large" autocomplete="off" v-else :model="forgotPasswordData"
                :rules="forgotPasswordRules">
                <el-form-item>
                    <h1>忘记密码</h1>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input :prefix-icon="User" placeholder="请输入邮箱" v-model="forgotPasswordData.email"></el-input>
                </el-form-item>
                <el-form-item prop="authorizationCode">
                    <el-input :prefix-icon="Lock" placeholder="请输入授权码"
                        v-model="forgotPasswordData.authorizationCode"></el-input>
                </el-form-item>
                <el-form-item prop="verificationCode">
                    <el-input :prefix-icon="Lock" placeholder="请输入验证码" v-model="forgotPasswordData.verificationCode">
                        <template #append>
                            <el-button :disabled="verificationCodeSent" @click="sendVerificationCode">{{
                                verificationCodeSent ? '已发送' : '发送验证码' }}</el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="newPassword">
                    <el-input :prefix-icon="Lock" type="password" placeholder="请输入新密码"
                        v-model="forgotPasswordData.newPassword"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="resetPassword">修改密码</el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="showForgotPassword = false">
                        返回登录
                    </el-link>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
    height: 100vh;
    position: relative;
    overflow: hidden; // 防止内容溢出
    background: url('@/assets/qishizhitong.png') no-repeat center/cover;
    background-color: #fff; // 背景颜色作为备用

    .form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;
        width: 25%; // 占据浏览器宽度的25%
        background-color: rgba(240, 240, 240, 0.9); // 偏白色的灰色背景颜色，透明度为0.9
        padding: 20px; // 可以根据需要调整内边距
        position: absolute; // 使表单绝对定位
        top: 0;
        right: 0; // 使表单紧贴右侧窗口
        bottom: 0;
        box-shadow: -10px 0 15px rgba(0, 0, 0, 0.1); // 添加阴影效果，增强视觉效果
    }

    .title {
        margin: 0 auto;
    }

    .button {
        width: 100%;
    }

    .flex {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
}
</style>