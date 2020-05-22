<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-right: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        添加权限
      </el-button>
    </div>
    <div class="filter-container">
      <el-input v-model="listQuery.description" placeholder="描述" style="width: 200px;" clearable class="filter-item" />
      <el-select v-model="listQuery.status" placeholder="类型" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table :data="permissionList" style="width: 100%;" border :loading="listLoading">
      <el-table-column align="center" label="序号">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="上级">
        <template slot-scope="scope">
          {{ scope.row.parent_label }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="路由">
        <template slot-scope="scope">
          {{ scope.row.url }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序">
        <template slot-scope="scope">
          {{ scope.row.sort }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-color="#13ce66"
            inactive-color="#999"
            :active-value="1"
            :inactive-value="0"
            @change="changeStatus(scope.$index, scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" @click="handleUpdate(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" @click="handleDelete(scope)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getPermissonList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="45%">
      <el-form ref="dataForm" :rules="rules" :model="permissionForm" label-position="right" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="上级权限" prop="parent_id">
          <el-cascader
            v-model="permissionForm.parent_id"
            :options="permissionMenu"
            :props="{ checkStrictly: true }"
            :disabled="parentIsDisabled"
            clearable
          />
        </el-form-item>
        <el-form-item label="名称(英文)" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入名称" />
        </el-form-item>

        <el-form-item label="权限描述" prop="description">
          <el-input v-model="permissionForm.description" placeholder="请输入描述" />
        </el-form-item>

        <el-form-item label="路由地址" prop="url">
          <el-input v-model="permissionForm.url" placeholder="请输入路由地址, 如: user/login" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="permissionForm.sort" :min="0" :max="100" label="描述文字" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio v-model="permissionForm.status" :label="1">启用</el-radio>
          <el-radio v-model="permissionForm.status" :label="0">禁用</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import * as PermissionOpt from '@/api/permission' // 权限操作

const statusOptions = [
  { id: 0, name: '禁用' },
  { id: 1, name: '启用' }
]

export default {
  components: { Pagination },
  data() {
    return {
      permissionMenu: [],
      permissionList: [],
      total: 0,
      permissionForm: {
        id: undefined,
        name: '',
        description: '',
        url: '',
        sort: 0,
        status: 1,
        parent_id: ''
      },
      statusOptions,
      listQuery: {
        page: 1,
        limit: 20,
        description: null,
        status: null,
        sort: null
      },
      dialogStatus: '',
      dialogFormVisible: false,
      parentIsDisabled: false,
      listLoading: true,
      checkStrictly: false,
      textMap: {
        update: '编辑权限',
        create: '添加权限'
      },
      rules: {
        parent_id: [{ required: true, message: '请选择上级', trigger: 'change' }],
        name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        description: [{ required: true, message: '请填写描述', trigger: 'blur' }],
        url: [{ required: true, message: '请填写路由', trigger: 'blur' }]
      }
    }
  },
  computed: {

  },
  created() {
    this.getPermissonList()
  },
  methods: {
    // 初始化表单
    initForm() {
      this.permissionForm = {
        id: undefined,
        name: '',
        description: '',
        url: '',
        sort: 0,
        status: 1,
        parent_id: ''
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getPermissonList()
    },
    handleCreate() {
      this.initForm()
      this.getPermissonMenu()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.parentIsDisabled = false
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.getPermissonMenu()
      this.permissionForm = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.parentIsDisabled = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认删除此权限?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const result = await PermissionOpt.deletePermission(row.id)
        this.permissionList.splice($index, 1)
        this.$message({
          type: 'success',
          message: result.message
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          PermissionOpt.addPermission(this.permissionForm).then((result) => {
            this.permissionForm.id = result.data.id
            this.permissionList.unshift(this.permissionForm)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const { name, description, url, status, sort } = this.permissionForm
          const tempData = { name, description, url, status, sort }
          var result = PermissionOpt.updatePermission(this.permissionForm.id, tempData)
          const index = this.permissionList.findIndex(v => v.id === this.permissionForm.id)
          this.permissionList.splice(index, 1, this.permissionForm)
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    getPermissonMenu() {
      PermissionOpt.getPermissonMenu().then(response => {
        const { data } = response

        this.permissionMenu = data
      }).catch(error => {
        console.log('权限菜单获取失败')
      })
    },
    getPermissonList() {
      this.listLoading = true
      // console.log(this.listQuery);
      PermissionOpt.getPermissonList(this.listQuery).then(response => {
        // console.log(response);
        this.permissionList = response.data.data
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(error => {
        console.log('权限列表获取失败')
      })
    },
    changeStatus(index, row) {
      PermissionOpt.updateStatus(row.id, row.status).then(response => {
        const data = response

        this.$notify({
          title: '成功',
          message: data.message,
          type: 'success'
        })
      }).catch(error => {
        this.$notify.error({
          title: '错误',
          message: data.message
        })

        this.permissionList[index].status = row.status
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    .roles-table {
      margin-top: 30px;
    }
    .permission-tree {
      margin-bottom: 30px;
    }
    .el-select {
      width: 100%;
    }
    .el-cascader {
      width: 100%;
    }
    .filter-container {
      padding-bottom: 2px;
    }
  }
  .pagination-container {
    background: #fff;
    padding: 5px 0;
  }
</style>
