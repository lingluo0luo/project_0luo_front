<template>
    <div>
        <el-card class="page-container">
            <template #header>
                <div class="header">
                    <span>文章管理</span>
                    <div class="controls">
                        <el-select v-model="selectedMonth" placeholder="选择月份" @change="updateMonth">
                            <el-option v-for="(month, index) in months" :key="index" :label="month.label"
                                :value="month.value" />
                        </el-select>
                        <el-button @click="prevMonth">上个月</el-button>
                        <el-button @click="nextMonth">下个月</el-button>
                        <el-button @click="prevWeek">上周</el-button>
                        <el-button @click="nextWeek">下周</el-button>
                    </div>
                </div>
            </template>
            <!-- 显示日历事件 -->
            <div v-if="filteredWeeks.length > 0">
                <div class="week">
                    <div v-for="(day, dayIndex) in filteredWeeks[currentWeekIndex]" :key="dayIndex" class="day">
                        <div class="day-header">
                            <span>{{ day.date.toLocaleDateString() }}</span>
                            <span class="day-of-week">
                                <span v-if="getDayOfWeek(day.date).isToday">{{ getDayOfWeek(day.date).dayOfWeek
                                }}(今日)</span>
                                <span v-else>{{ getDayOfWeek(day.date).dayOfWeek }}</span>
                            </span>
                        </div>
                        <div v-if="day.events.length > 0" class="events">
                            <div v-for="(event, eventIndex) in day.events" :key="eventIndex" class="event">
                                <p><strong>{{ event.summary }}</strong></p>
                                <p>开始时间: {{ event.start.toLocaleTimeString() }}</p>
                                <p>结束时间: {{ event.end.toLocaleTimeString() }}</p>
                            </div>
                        </div>
                        <div v-else class="no-events">
                            <p>没有事件</p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <p>没有日历事件</p>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElCard, ElButton, ElSelect, ElOption, ElMessage } from 'element-plus'
import ICAL from 'ical.js'
import { useTokenStore } from '@/stores/token.js';
import { ifToken } from '@/api/artcle'

const tokenStore = useTokenStore()
const events = ref([])
const currentDate = ref(new Date())
const selectedMonth = ref(currentDate.value.getMonth())
const currentWeekIndex = ref(0)

const months = [
    { label: '一月', value: 0 },
    { label: '二月', value: 1 },
    { label: '三月', value: 2 },
    { label: '四月', value: 3 },
    { label: '五月', value: 4 },
    { label: '六月', value: 5 },
    { label: '七月', value: 6 },
    { label: '八月', value: 7 },
    { label: '九月', value: 8 },
    { label: '十月', value: 9 },
    { label: '十一月', value: 10 },
    { label: '十二月', value: 11 }
]

onMounted(async () => {
    try {
        // 读取本地 ICS 文件
        const response = await fetch('/calendar.ics')
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const icsData = await response.text()
        const jcalData = ICAL.parse(icsData)
        const vcalendar = new ICAL.Component(jcalData)

        vcalendar.getAllSubcomponents('vevent').forEach(function (vevent) {
            const event = new ICAL.Event(vevent)
            events.value.push({
                summary: event.summary,
                start: event.startDate.toJSDate(),
                end: event.endDate.toJSDate()
            })
        })

        // 计算当前周的起始日期（周一）
        const currentMonday = new Date(currentDate.value)
        currentMonday.setDate(currentMonday.getDate() - currentMonday.getDay() + 1)
        selectedMonth.value = currentMonday.getMonth()
        recalculateCurrentWeekIndex(currentMonday)
    } catch (error) {
        console.error('Error fetching and parsing ICS file:', error)
    }

    try {
        const token = tokenStore.token;
        const response = await ifToken({ token });

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
})

const weeks = computed(() => {
    const sortedEvents = [...events.value].sort((a, b) => a.start - b.start)
    const weeksArray = []

    let currentYear = currentDate.value.getFullYear()
    for (let month = 0; month < 12; month++) {
        let tempCurrentWeekStart = new Date(currentYear, month, 1)
        while (tempCurrentWeekStart.getDay() !== 1) { // Adjusted to start from Monday
            tempCurrentWeekStart.setDate(tempCurrentWeekStart.getDate() + 1)
        }
        for (let i = 0; i < 6; i++) { // Assuming we want to show up to 6 weeks per month
            const week = []
            for (let j = 0; j < 7; j++) {
                const date = new Date(tempCurrentWeekStart.getFullYear(), tempCurrentWeekStart.getMonth(), tempCurrentWeekStart.getDate() + j)
                const dayEvents = sortedEvents.filter(event =>
                    event.start <= new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1) &&
                    event.end >= new Date(date.getFullYear(), date.getMonth(), date.getDate())
                )
                week.push({ date, events: dayEvents })
            }
            weeksArray.push(week)
            tempCurrentWeekStart.setDate(tempCurrentWeekStart.getDate() + 7)
        }
    }

    return weeksArray
})

const filteredWeeks = computed(() => {
    const month = selectedMonth.value
    return weeks.value.filter(week => week[0].date.getMonth() === month)
})

const recalculateCurrentWeekIndex = (targetDate) => {
    const weeksArray = filteredWeeks.value
    for (let i = 0; i < weeksArray.length; i++) {
        const week = weeksArray[i]
        if (week.some(day => day.date.toDateString() === targetDate.toDateString())) {
            currentWeekIndex.value = i
            break
        }
    }
}

const recalculateCurrentWeekStart = () => {
    const weeksArray = filteredWeeks.value
    const targetWeek = weeksArray[currentWeekIndex.value]
    if (targetWeek && targetWeek.length > 0) {
        currentDate.value = targetWeek[0].date
    }
}

const prevWeek = () => {
    if (currentWeekIndex.value > 0) {
        currentWeekIndex.value--
        recalculateCurrentWeekStart()
    }
}

const nextWeek = () => {
    if (currentWeekIndex.value < filteredWeeks.value.length - 1) {
        currentWeekIndex.value++
        recalculateCurrentWeekStart()
    }
}

const updateMonth = (newMonth) => {
    selectedMonth.value = newMonth
    currentWeekIndex.value = 0
    recalculateCurrentWeekStart()
}

const prevMonth = () => {
    if (selectedMonth.value > 0) {
        selectedMonth.value--
        currentWeekIndex.value = 0
        recalculateCurrentWeekStart()
    }
}

const nextMonth = () => {
    if (selectedMonth.value < 11) {
        selectedMonth.value++
        currentWeekIndex.value = 0
        recalculateCurrentWeekStart()
    }
}

// 获取星期几的函数
const getDayOfWeek = (date) => {
    const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 将时间部分设置为0，以便比较日期部分
    date.setHours(0, 0, 0, 0) // 同样处理传入的日期

    const dayOfWeek = daysOfWeek[date.getDay()]
    const isToday = today.getTime() === date.getTime()

    return { dayOfWeek, isToday }
}
</script>

<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .controls {
            display: flex;
            align-items: center;

            button {
                margin-left: 10px;
            }

            .el-select {
                margin-right: 10px;
            }
        }
    }

    .week {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;

        .day {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 1rem;

            .day-header {
                font-weight: bold;
                margin-bottom: 1rem;

                .day-of-week {
                    margin-left: 5px;
                    font-weight: normal;
                }
            }

            .events {
                .event {
                    margin-bottom: 1rem;
                    padding: 0.5rem;
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 4px;

                    p {
                        margin: 0;
                    }
                }
            }

            .no-events {
                color: #888;
            }
        }
    }
}
</style>