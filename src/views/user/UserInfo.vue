<script setup>
import { ref } from 'vue'
import useUserInfoStore from '@/stores/userInfo.js'
import { changePasswordService } from '@/api/user.js'
import { ElMessage } from 'element-plus'

const userInfoStore = useUserInfoStore();

const changePasswordForm = ref({
    name: '',
    oldPassword: '',
    newPassword: ''
})

const rules = {
    name: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    oldPassword: [
        { required: true, message: '请输入旧密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' }
    ]
}

const changePassword = async () => {
    // 确保只发送 name, oldPassword, newPassword
    const dataToSend = {
        name: changePasswordForm.value.name,
        oldPassword: changePasswordForm.value.oldPassword,
        newPassword: changePasswordForm.value.newPassword
    };

    let result = await changePasswordService(dataToSend);
    ElMessage.success(result.msg ? result.msg : '密码修改成功');

}
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>基本资料</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-form :model="changePasswordForm" :rules="rules" label-width="100px" size="large">
                    <el-form-item label="用户名" prop="name">
                        <el-input v-model="changePasswordForm.name"></el-input>
                    </el-form-item>
                    <el-form-item label="旧密码" prop="oldPassword">
                        <el-input type="password" v-model="changePasswordForm.oldPassword"></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPassword">
                        <el-input type="password" v-model="changePasswordForm.newPassword"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="changePassword">修改密码</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </el-card>
</template>