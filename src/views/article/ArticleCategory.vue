<script setup>
import {
    Edit,
    Delete
} from '@element-plus/icons-vue'
import { ref } from 'vue'
const categorys = ref([
])
import { articleCategoryListService, articleCategoryAddService, articleCategoryUpdateService, articleCategoryDeleteService } from '@/api/artcle.js'
const articleCategoryList = async () => {
    const res = await articleCategoryListService()
    categorys.value = res.data
}
articleCategoryList();

let dialogVisible = ref(false)

//添加分类数据模型
const categoryModel = ref({
    categoryName: '',
    categoryAlias: ''
})
//添加分类表单校验
const rules = {
    categoryName: [
        { required: true, message: '请输入日程分类', trigger: 'blur' },
    ],
    categoryAlias: [
        { required: true, message: '请输入日程内容', trigger: 'blur' },
    ]
}
import { ElMessage } from 'element-plus'
const addCategory = async () => {
    let result = await articleCategoryAddService(categoryModel.value)
    ElMessage.success(result.message ? result.message : "添加成功")
    articleCategoryList();
    dialogVisible.value = false
}

let title = ref('')

const showDialog = (row) => {
    dialogVisible.value = true
    title.value = '修改日程'
    categoryModel.value.categoryName = row.categoryName
    categoryModel.value.categoryAlias = row.categoryAlias
    categoryModel.value.id = row.id
}

const updateCategory = async () => {
    let result = await articleCategoryUpdateService(categoryModel.value)
    ElMessage.success(result.message ? result.message : "修改成功")
    articleCategoryList();
    dialogVisible.value = false
}

const clearData = () => {
    categoryModel.value.categoryName = "";
    categoryModel.value.categoryAlias = "";
}
import { ElMessageBox } from 'element-plus'
const deleteCategory = async (row) => {
    ElMessageBox.confirm(
        '你确认要删除该条日程信息吗?',
        '提示',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            let result = await articleCategoryDeleteService(row.id)
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
            articleCategoryList();
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '删除取消',
            })
        })
    articleCategoryList();
}
</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>记事本</span>
                <div class="extra">
                    <el-button type="primary" @click="dialogVisible = true; title = '添加日程'; clearData()">记事</el-button>
                </div>
            </div>
        </template>
        <el-table :data="categorys" style="width: 100%">
            <el-table-column label="序号" width="100" type="index"> </el-table-column>
            <el-table-column label="题目" prop="categoryName"></el-table-column>
            <el-table-column label="内容" prop="categoryAlias"></el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    <el-button :icon="Edit" circle plain type="primary" @click="showDialog(row)"></el-button>
                    <el-button :icon="Delete" circle plain type="danger" @click="deleteCategory(row)"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>

        <el-dialog v-model="dialogVisible" :title="title" width="30%">
            <el-form :model="categoryModel" :rules="rules" label-width="100px" style="padding-right: 30px">
                <el-form-item label="题目" prop="categoryName">
                    <el-input v-model="categoryModel.categoryName" minlength="1" maxlength="10"></el-input>
                </el-form-item>
                <el-form-item label="内容" prop="categoryAlias">
                    <el-input v-model="categoryModel.categoryAlias" minlength="1" maxlength="15"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click=" title == '添加日程' ? addCategory() : updateCategory()"> 确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </el-card>
</template>

<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
</style>