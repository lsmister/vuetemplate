<!--
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-right: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        添加用户
      </el-button>
    </div>
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="登录账号" style="width: 200px;" clearable class="filter-item" />
      <el-input v-model="listQuery.name" placeholder="昵称" style="width: 200px;" clearable class="filter-item" />
      <el-select v-model="listQuery.status" placeholder="状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table :data="list" style="width: 100%;" border :loading="listLoading">
      <el-table-column align="center" label="序号">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="登录账号">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="商户号">
        <template slot-scope="scope">
          {{ scope.row.merchant_id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="谷歌验证">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.google_status"
            active-color="#13ce66"
            inactive-color="#999"
            :active-value="1"
            :inactive-value="0"
            @change="changeStatus(scope.$index, scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="添加时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="45%">
      <el-form ref="dataForm" :rules="rules" :model="subForm" label-position="right" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="登录账号(英文)" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item label="昵称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>

        <el-form-item label="角色" prop="role_id">
          <el-select v-model="form.role_id" placeholder="请选择角色">
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio v-model="form.status" :label="1">启用</el-radio>
          <el-radio v-model="form.status" :label="0">禁用</el-radio>
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
import * as UserOpt from '@/api/user'

const statusOptions = [
  { id: 0, name: '禁用' },
  { id: 1, name: '启用' }
]

export default {
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      roles: [],
      subForm: {
        id: undefined,
        username: '',
        name: '',
        role_id: '',
        status: 1
      },
      statusOptions,
      listQuery: {
        page: 1,
        limit: 20,
        username: null,
        status: null,
        name: null
      },
      dialogStatus: '',
      dialogFormVisible: false,
      listLoading: true,
      checkStrictly: false,
      textMap: {
        update: '编辑用户',
        create: '添加用户'
      },
      rules: {
        role_id: [{ required: true, message: '请选择角色', trigger: 'change' }],
        name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        username: [{ required: true, message: '请填写登录账号', trigger: 'blur' }],
      }
    }
  },
  computed: {

  },
  created() {
    this.getList()
  },
  methods: {
    // 初始化表单
    initForm() {
      this.subForm = {
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
      this.getList()
    },
    handleCreate() {
      this.initForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.subForm = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认删除此用户?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const result = await UserOpt.deletePermission(row.id)
        this.list.splice($index, 1)
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
          UserOpt.addPermission(this.subForm).then((result) => {
            this.subForm.id = result.data.id
            this.list.unshift(this.subForm)
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
          const { name, description, url, status, sort } = this.subForm
          const tempData = { name, description, url, status, sort }
          var result = UserOpt.updatePermission(this.subForm.id, tempData)
          const index = this.list.findIndex(v => v.id === this.subForm.id)
          this.list.splice(index, 1, this.subForm)
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
    getList() {
      this.listLoading = true
      UserOpt.getList(this.listQuery).then(response => {
        this.list = response.data.data
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
      UserOpt.updateStatus(row.id, row.status).then(response => {
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

        this.list[index].status = row.status
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
-->
