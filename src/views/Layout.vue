<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElDialog, ElSlider } from 'element-plus'
import {
    Management,
    Promotion,
    UserFilled,
    User,
    Crop,
    EditPen,
    SwitchButton,
    CaretBottom
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'
import { getWeather } from '@/utils/requestWeather.js' // 导入getWeather函数
import { useRouter } from 'vue-router'
const router = useRouter()
// 定义响应式数据属性
const currentTime = ref(new Date().toLocaleTimeString())
const isContentVisible = ref(false)
const weatherInfo = ref({
    weather: '',
    temperature: '',
    winddirection: '',
    windpower: '',
    humidity: '',
    reporttime: ''
})

// 提取文件名的函数
const extractFileName = (filePath) => {
    return filePath.split('/').pop().split('.').slice(0, -1).join('.')
}

// 音乐播放相关的数据属性
const audioList = ref([
    { path: '/src/assets/古法制茶.flac' },
    { path: '/src/assets/中华墨水娘.mp3' },
    { path: '/src/assets/江楼,心华 - 玛格丽特.mp3' },
    { path: '/src/assets/忘川风华录 - 多情岸（洛天依原创）.mp3' },
    { path: '/src/assets/横山菁児 - エンディング~旭日を浴びて.mp3' },
    { path: '/src/assets/宇多田ヒカル - Goodbye Happiness.flac' },
    { path: '/src/assets/洛天依Official - Aloud.flac' },
    { path: '/src/assets/Padi,洛天依,言和 - 漪涟依旧.flac' }
])

const audioListWithNames = computed(() => {
    return audioList.value.map(item => ({
        ...item,
        name: extractFileName(item.path)
    }))
})

const currentTrackIndex = ref(0)
const isMusicPlayerVisible = ref(true)

// 控制音乐播放的方法
const audioPlayer = ref(null)

const playPauseMusic = () => {
    if (audioPlayer.value.paused) {
        audioPlayer.value.play().catch(error => {
            console.error('播放音频失败:', error)
            alert('播放音频失败，请检查文件路径是否正确。')
        })
    } else {
        audioPlayer.value.pause()
    }
}

const previousTrack = () => {
    if (currentTrackIndex.value > 0) {
        currentTrackIndex.value--
        const filePath = audioListWithNames.value[currentTrackIndex.value].path
        checkFileExists(filePath).then(exists => {
            if (exists) {
                audioPlayer.value.src = filePath
                audioPlayer.value.play().catch(error => {
                    console.error('播放音频失败:', error)
                    alert('播放音频失败，请检查文件路径是否正确。')
                })
            } else {
                alert('音频文件不存在，请检查文件路径是否正确。')
            }
        })
    }
}

const nextTrack = () => {
    if (currentTrackIndex.value < audioListWithNames.value.length - 1) {
        currentTrackIndex.value++
        const filePath = audioListWithNames.value[currentTrackIndex.value].path
        checkFileExists(filePath).then(exists => {
            if (exists) {
                audioPlayer.value.src = filePath
                audioPlayer.value.load() // 加载新音频文件
                audioPlayer.value.addEventListener('loadeddata', () => {
                    audioPlayer.value.play().catch(error => {
                        console.error('播放音频失败:', error)
                        alert('播放音频失败，请检查文件路径是否正确。')
                    })
                })
            } else {
                alert('音频文件不存在，请检查文件路径是否正确。')
            }
        })
    }
}

const selectTrack = (index) => {
    currentTrackIndex.value = index
    const filePath = audioListWithNames.value[currentTrackIndex.value].path
    checkFileExists(filePath).then(exists => {
        if (exists) {
            audioPlayer.value.src = filePath
            audioPlayer.value.load() // 加载新音频文件
            audioPlayer.value.addEventListener('loadeddata', () => {
                audioPlayer.value.play().catch(error => {
                    console.error('播放音频失败:', error)
                    alert('播放音频失败，请检查文件路径是否正确。')
                })
            })
        } else {
            alert('音频文件不存在，请检查文件路径是否正确。')
        }
    })
    togglePlaylist()
}

// 更新时间的函数
const updateTime = () => {
    currentTime.value = new Date().toLocaleTimeString()
}

// 获取天气信息的函数
const fetchWeather = async () => {
    try {
        const response = await getWeather()
        if (response) {
            weatherInfo.value = response
        }
    } catch (error) {
        console.error('获取天气信息失败:', error)
        weatherInfo.value = {
            weather: '无法获取天气信息',
            temperature: '-',
            winddirection: '-',
            windpower: '-',
            humidity: '-',
            reporttime: '-'
        }
    }
}

// 检查文件是否存在的函数
const checkFileExists = async (filePath) => {
    try {
        const response = await fetch(filePath)
        return response.ok
    } catch (error) {
        console.error('检查文件存在性失败:', error)
        return false
    }
}

// 启动定时器
let intervalId
onMounted(() => {
    intervalId = setInterval(updateTime, 1000)
    window.addEventListener('wheel', handleScroll)
    fetchWeather() // 获取天气信息
})

// 停止定时器
onBeforeUnmount(() => {
    clearInterval(intervalId)
    window.removeEventListener('wheel', handleScroll)
})

// 处理滚动事件
const handleScroll = (event) => {
    if (event.deltaY > 0 && !isContentVisible.value) {
        isContentVisible.value = true
    } else if (event.deltaY < 0 && isContentVisible.value) {
        isContentVisible.value = false
    }
}

// 定义歌曲列表显示状态的响应式变量
const isPlaylistVisible = ref(false)

// 切换歌曲列表显示状态的方法
const togglePlaylist = () => {
    isPlaylistVisible.value = !isPlaylistVisible.value;

};

// 弹出框相关
const dialogVisible = ref(false)
const progress = ref(0)
const audioDuration = ref(0)

// 监听音频播放进度
watch(audioPlayer, (player) => {
    if (player) {
        player.addEventListener('timeupdate', () => {
            progress.value = player.currentTime
            audioDuration.value = player.duration
        })
    }
})

const handleFooterClick = (event) => {
    // 检查点击是否发生在按钮区域之外
    const buttons = document.querySelectorAll('.music-player button')
    let isButtonClicked = false

    buttons.forEach(button => {
        if (button.contains(event.target)) {
            isButtonClicked = true
        }
    })

    if (!isButtonClicked) {
        dialogVisible.value = true
    }
}

const formatTooltip = (value) => {
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const handleDropdownCommand = (command) => {
    switch (command) {
        case 'profile':
            // 处理基本资料点击事件
            break
        case 'avatar':
            // 处理更换头像点击事件
            break
        case 'password':
            // 处理重置密码点击事件
            router.push('/user/info')
            break
        case 'logout':
            // 处理退出登录点击事件
            router.push('/login')
            break
        default:
            break
    }
}
const isSmallPlaylistVisible = ref(false)
const toggleSmallPlaylist = () => {
    isSmallPlaylistVisible.value = !isSmallPlaylistVisible.value
}
</script>

<template>
    <el-container class="layout-container">
        <!-- 初始欢迎页面 -->
        <transition name="fade">
            <div v-if="!isContentVisible" class="welcome-page">
                <h1>欢迎回来!</h1>
                <p>现在的时间是: {{ currentTime }}</p>
            </div>
        </transition>
        <!-- 主页面内容 -->
        <transition name="fade">
            <el-container v-if="isContentVisible" class="content-fade-in">
                <!-- 左侧菜单 -->
                <el-aside width="225px">
                    <div class="el-aside__logo">
                        <div class="nowtime"><strong>现在的时间是: {{ currentTime }}</strong></div>
                    </div>
                    <el-menu active-text-color="#ffd04b" background-color="#66ccff" text-color="#fff" router>
                        <el-menu-item index="/article/category">
                            <el-icon>
                                <Management />
                            </el-icon>
                            <span>日程</span>
                        </el-menu-item>
                        <el-menu-item index="/article/class">
                            <el-icon>
                                <Management />
                            </el-icon>
                            <span>课表</span>
                        </el-menu-item>
                        <el-menu-item index="/article/manage">
                            <el-icon>
                                <Promotion />
                            </el-icon>
                            <span>常用网址</span>
                        </el-menu-item>
                        <el-sub-menu index="3">
                            <template #title>
                                <el-icon>
                                    <UserFilled />
                                </el-icon>
                                <span>占位</span>
                            </template>
                            <!-- <el-menu-item index="/user/info">
                                <el-icon>
                                    <User />
                                </el-icon>
                                <span>占位1</span>
                            </el-menu-item> -->
                            <el-menu-item index="/user/avatar">
                                <el-icon>
                                    <Crop />
                                </el-icon>
                                <span>占位2</span>
                            </el-menu-item>
                            <el-menu-item index="/user/resetPassword">
                                <el-icon>
                                    <EditPen />
                                </el-icon>
                                <span>占位3</span>
                            </el-menu-item>
                        </el-sub-menu>
                    </el-menu>
                </el-aside>
                <!-- 右侧主区域 -->
                <el-container>
                    <!-- 头部区域 -->
                    <el-header>
                        <div class="weather-info">
                            <div>
                                <strong>{{ weatherInfo.city }} 当前天气: {{ weatherInfo.weather }}</strong>
                            </div>
                            <div>
                                <strong>温度: {{ weatherInfo.temperature }}°C</strong>
                            </div>
                            <div>
                                <strong>风向: {{ weatherInfo.winddirection }}</strong>
                            </div>
                            <div>
                                <strong>风力: {{ weatherInfo.windpower }} 级</strong>
                            </div>
                            <div>
                                <strong>湿度: {{ weatherInfo.humidity }}%</strong>
                            </div>
                            <div>
                                <strong>发布时间: {{ weatherInfo.reporttime }}</strong>
                            </div>
                        </div>
                        <el-dropdown placement="bottom-end" @command="handleDropdownCommand">
                            <span class="el-dropdown__box">
                                <el-avatar :src="avatar" />
                                <el-icon>
                                    <CaretBottom />
                                </el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <!-- <el-dropdown-item command="profile" :icon="User">基本资料</el-dropdown-item> -->
                                    <!-- <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item> -->
                                    <el-dropdown-item command="password" :icon="EditPen">修改密码</el-dropdown-item>
                                    <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </el-header>
                    <!-- 中间区域 -->
                    <el-main>
                        <router-view></router-view>
                    </el-main>
                    <!-- 底部区域 -->
                    <el-footer style="position: relative;" @click="handleFooterClick">
                        <div v-if="isMusicPlayerVisible" class="music-player">
                            <p>当前播放: {{ audioListWithNames[currentTrackIndex].name }}</p>
                            <button @click="previousTrack">上一曲</button>
                            <button @click="playPauseMusic">暂停/播放</button>
                            <button @click="nextTrack">下一曲</button>
                            <button @click="toggleSmallPlaylist">播放列表</button>
                            <div v-if="isSmallPlaylistVisible" class="small-playlist">
                                <ul>
                                    <li v-for="(track, index) in audioListWithNames" :key="index"
                                        @click="selectTrack(index)">
                                        {{ track.name }}
                                    </li>
                                </ul>
                            </div>
                            <audio ref="audioPlayer" :src="audioListWithNames[currentTrackIndex].path" controls></audio>
                        </div>
                        <div v-else class="placeholder">底部占位</div>
                        <el-dialog v-model="dialogVisible" fullscreen custom-class="custom-dialog"
                            style="text-align:center">
                            <p>当前播放的歌曲是:</p>


                            <div class="dialog-controls">
                                <button @click="previousTrack">上一曲</button>
                                <button @click="playPauseMusic">暂停/播放</button>
                                <button @click="nextTrack">下一曲</button>
                            </div>
                            <p>歌曲名: {{ audioListWithNames[currentTrackIndex].name }}</p>
                            <el-slider v-model="progress" :max="audioDuration" :format-tooltip="formatTooltip" />
                            <!-- 添加音乐列表 -->
                            <div class="playlist">
                                <ul>
                                    <li v-for="(track, index) in audioListWithNames" :key="index"
                                        @click="selectTrack(index)">
                                        {{ track.name }}
                                    </li>
                                </ul>
                            </div>
                        </el-dialog>
                    </el-footer>
                </el-container>
            </el-container>
        </transition>
    </el-container>
</template>


<style lang="scss" scoped>
.layout-container {
    height: 100vh;
    position: relative;
    overflow: hidden; // 防止内容溢出
}

.welcome-page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh; // 确保欢迎页面高度等于视口高度
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    z-index: 1000;
    transition: opacity 1s ease-out;
    font-size: 25px;
}

.content-fade-in {
    position: relative;
    z-index: 1001;
    transition: opacity 1s ease-out;
    height: 100vh; // 确保主页面高度等于视口高度
    overflow: hidden; // 防止内容溢出
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease-out, transform 1s ease-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.el-aside {
    background-color: #66ccff;
    height: 100%; // 确保左侧菜单高度等于父容器高度

    &__logo {
        position: relative;
        height: 250px;
        background: url('/src/assets/602166B0C42DE4C46E85F3198E3A7B77.jpg') no-repeat center / 250px auto;

        .nowtime {
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 16px;
            color: black;
            opacity: 1;
            text-align: center;
        }
    }

    .el-menu {
        border-right: none;
        height: calc(100% - 250px); // 确保菜单高度适应剩余空间
        overflow-y: auto; // 允许菜单内容滚动
    }
}

.el-header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px; // 设置header的高度
    padding: 0 20px;

    .weather-info {
        display: flex;
        align-items: center;
        gap: 10px; // 减少间距
        flex-wrap: nowrap; // 不允许换行

        div {
            flex: 0 0 auto; // 每个项不增长也不收缩
            white-space: nowrap; // 防止文本换行
        }
    }

    .el-dropdown__box {
        display: flex;
        align-items: center;

        .el-icon {
            color: #999;
            margin-left: 10px;
        }

        &:active,
        &:focus {
            outline: none;
        }
    }
}

.el-main {
    height: calc(100vh - 60px - 60px); // 计算main的高度，减去header和footer的高度
    overflow-y: auto; // 允许主要内容滚动
}

.el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
    height: 60px; // 设置footer的高度
    position: relative;
    transition: opacity 0.5s ease-out;

    .music-player {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
        border-top: 1px solid #ccc;
        height: 60px;

        button {
            margin: 0 10px;
            padding: 5px 10px;
            border: none;
            background-color: #66ccff;
            color: #fff;
            border-radius: 4px;
            cursor: pointer;

            &:hover {
                background-color: #409EFF;
            }
        }

        p {
            margin: 0;
            margin-left: 20px;
        }

        audio {
            margin-left: 20px;
        }

        ul {
            position: absolute;
            bottom: 60px; // 调整列表位置，使其位于音乐播放器上方
            left: 0;
            right: 0;
            background-color: rgba(255, 255, 255, 0.9); // 半透明背景色
            border: 1px solid #ccc; // 边框
            padding: 10px; // 内边距
            list-style-type: none; // 移除默认的列表样式
            margin: 0; // 外边距
            max-height: 150px; // 最大高度
            overflow-y: auto; // 允许垂直滚动
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); // 阴影效果

            li {
                padding: 5px 10px;
                cursor: pointer;

                &:hover {
                    background-color: #f0f0f0; // 悬停效果
                }
            }
        }
    }

    .placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
}

/* 新增动画类 */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.5s ease;
}

// .custom-dialog-enter-active,
// .custom-dialog-leave-active {
//     transition: all 0.5s ease;
// }

// .custom-dialog-enter-from,
// .custom-dialog-leave-to {
//     transform: translateY(100%);
//     opacity: 0;
// }

.slide-ente r-from,
.slide-leave-to {
    transform: translateY(10px);
    opacity: 0;
}

/* 调整歌曲列表的宽度 */
.el-footer .music-player ul {
    width: 80%;
    /* 设置宽度为视口宽度的80% */
    max-width: 400px;
    /* 最大宽度为400px */
    margin: 0 auto;
    /* 居中显示 */
}

.el-dialog--fullscreen {
    background-color: rgba(255, 255, 255, 0.9); // 调整背景颜色
    padding: 20px; // 调整内边距
}

.el-dialog__body {
    padding: 20px;
    text-align: center;
    display: flex; // 使用flex布局
    flex-direction: column; // 垂直排列子元素
    align-items: center; // 水平居中子元素
}

.el-dialog__body p {
    text-align: center; // 确保段落内容居中
}

.dialog-controls {
    margin-bottom: 20px;
    display: flex; // 使用flex布局
    justify-content: center; // 水平居中子元素
    align-items: center; // 垂直居中子元素
}

.el-slider {
    width: 100%; // 确保进度条占满整个宽度
}

.el-dialog--fullscreen {
    background-color: rgba(63, 215, 167, 0.9); // 调整背景颜色的透明度
    background-image: url('src/assets/qishizhitong.png'); // 添加背景图片
    background-size: cover; // 使背景图片覆盖整个对话框
    background-position: center; // 将背景图片居中
    padding: 20px; // 调整内边距
}

.dialog-controls button {
    margin: 0 10px;
    padding: 5px 10px;
    border: none;
    background-color: #66ccff;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #409EFF;
    }
}

.playlist {
    margin-top: 20px;
    text-align: left;

}

.playlist {
    margin-top: 20px;
    text-align: left;

    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        padding: 5px 10px;
        cursor: pointer;

        &:hover {
            background-color: #66ccff;
        }
    }
}
</style>