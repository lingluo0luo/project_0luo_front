<template>
    <div class="container">
        <h2>常用网页</h2>
        <div class="link-grid">
            <div class="link-block" v-for="(link, index) in links" :key="index" @mouseover="hoverIndex = index"
                @mouseleave="hoverIndex = null">
                <a :href="ensureProtocol(link.url)" target="_blank" class="link-item">
                    {{ link.name }}
                </a>
                <span class="delete-icon" v-show="hoverIndex === index" @click="removeLink(index)">×</span>
            </div>
            <!-- 加号方块 -->
            <div class="link-block add-block" @click="showModal = true">
                <span class="add-icon">+</span>
            </div>
        </div>

        <!-- 模态框 -->
        <div class="modal" v-if="showModal">
            <div class="modal-content">
                <span class="close" @click="showModal = false">&times;</span>
                <h3>添加新网站</h3>
                <form @submit.prevent="addLink">
                    <div class="form-group">
                        <label for="name">网站名称:</label>
                        <input type="text" id="name" v-model="newLink.name" required>
                    </div>
                    <div class="form-group">
                        <label for="url">网站URL:</label>
                        <input type="text" id="url" v-model="newLink.url" required>
                    </div>
                    <button type="submit">添加</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'; // 导入 ref 和 onMounted
import { useRouter } from 'vue-router'; // 导入 useRouter
import { ElMessage } from 'element-plus'; // 导入 ElMessage
import { ifToken } from '@/api/artcle'; // 确保路径正确
import { useTokenStore } from '@/stores/token.js';

export default {
    setup() {
        const router = useRouter();
        const tokenStore = useTokenStore();

        const links = ref(JSON.parse(localStorage.getItem('links')) || [
            { name: '抖音', url: 'www.douyin.com' },
            { name: '哔哩哔哩', url: 'www.bilibili.com' },
            // 你可以在这里继续添加更多的链接
        ]);
        const showModal = ref(false);
        const newLink = ref({
            name: '',
            url: ''
        });
        const hoverIndex = ref(null);

        onMounted(async () => {
            try {
                const token = tokenStore.token;
                const response = await ifToken({ token });
                console.log("进来了");

                if (response.code === 1) {
                    // 如果 code 为 1，跳转到 /login
                    router.push('/login');
                    ElMessage.error("Token无效，请重新登录");
                } else {
                    ElMessage.success("Token验证成功");
                }
            } catch (error) {
                console.error('Error sending token to backend:', error);
                ElMessage.error(error.message ? error.message : "Token验证失败");
            }
        });

        const ensureProtocol = (url) => {
            if (!/^https?:\/\//i.test(url)) {
                return `https://${url}`;
            }
            return url;
        };

        const addLink = () => {
            if (newLink.value.name && newLink.value.url) {
                links.value.push({ ...newLink.value });
                localStorage.setItem('links', JSON.stringify(links.value));
                newLink.value = { name: '', url: '' };
                showModal.value = false;
            }
        };

        const removeLink = (index) => {
            links.value.splice(index, 1);
            localStorage.setItem('links', JSON.stringify(links.value));
        };

        return {
            links,
            showModal,
            newLink,
            hoverIndex,
            ensureProtocol,
            addLink,
            removeLink
        };
    }
};
</script>

<style scoped>
/* 你的样式代码 */
</style>

<style scoped>
.container {
    text-align: center;
}

.link-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    justify-content: center;
    padding: 20px;
}

.link-block {
    background-color: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    width: 150px;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    /* 添加相对定位 */
}

.link-block:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.link-item {
    display: block;
    padding: 20px;
    text-decoration: none;
    color: #333;
    font-size: 16px;
    text-align: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}

.link-item:hover {
    color: #007bff;
}

.delete-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    color: red;
    font-size: 24px;
    cursor: pointer;
    z-index: 1;
}

.add-block {
    background-color: #007bff;
    color: white;
    font-size: 24px;
    font-weight: bold;
}

.modal {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #0056b3;
}
</style>