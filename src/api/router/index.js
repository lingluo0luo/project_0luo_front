import { createRouter, createWebHistory } from "vue-router"
import  LayoutVue from "@/views/Layout.vue"
import  LoginVue from "@/views/Login.vue";
import ArticleCategoryVue from "@/views/article/ArticleCategory.vue";
import ArticleManageVue from "@/views/article/ArticleManage.vue";
import ArticleClassVue from "@/views/article/ArticleClass.vue";
import UserAvatarVue from "@/views/user/UserAvatar.vue";
import UserInfoVue from "@/views/user/UserInfo.vue";
import UserResetPasswordVue from "@/views/user/UserResetPassword.vue";
const routes = [
    {path: '/login', component:LoginVue },
    {
        path: '/', component: LayoutVue,redirect: '/article/class', children: [
            { path: '/article/category', component: ArticleCategoryVue },
            { path: '/article/class', component: ArticleClassVue },
            { path: '/article/manage', component: ArticleManageVue },
            { path: '/user/avatar', component: UserAvatarVue },
            { path: '/user/info', component: UserInfoVue },
            { path: '/user/resetPassword', component: UserResetPasswordVue },
    ] }
]

const router = createRouter({
    routes: routes,
    history: createWebHistory()
})

export default router