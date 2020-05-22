<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">
      添加角色
    </el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="序号" width="220">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" @click="handleEdit(scope)">
            编辑
          </el-button>
          <el-button type="danger" @click="handleDelete(scope)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getRoles" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'添加角色'" width="60%">
      <div style="height: 400px;overflow-x: hidden;overflow-y: auto;">
        <el-form ref="dataForm" :rules="rules" :model="role" label-width="120px" label-position="right">
          <el-form-item label="角色名(英文)" prop="name">
            <el-input v-model="role.name" placeholder="输入角色名称" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="role.description" placeholder="输入角色描述" />
          </el-form-item>
          <el-form-item label="分配权限">
            <el-tree ref="tree" :check-strictly="checkStrictly" :data="routesData" :props="defaultProps" default-expand-all show-checkbox node-key="id" class="permission-tree" />
          </el-form-item>
        </el-form>
      </div>

      <div style="text-align:right;">
        <el-button @click="dialogVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmRole">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination'
import { getRoutes, getRoles, addRole, deleteRole, updateRole } from '@/api/role'

const defaultRole = {
  id: '',
  name: '',
  description: '',
  routes: []
}

export default {
  components: { Pagination },
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [],
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      rules: {
        name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        description: [{ required: true, message: '请填写描述', trigger: 'blur' }]
      },
      total: 0,
      listQuery: {
        page: 1,
        limit: 20
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getRoutes()
    this.getRoles()
  },
  methods: {
    async getRoutes() {
      const res = await getRoutes()
      this.routes = this.generateRoutes(res.data)
    },
    async getRoles() {
      const res = await getRoles(this.listQuery)
      this.rolesList = res.data.data
      this.total = res.data.total
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children2, route)

        if (route.children2 && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          title: route.description,
          id: route.id
        }

        // recursive child routes
        if (route.children2) {
          data.children = this.generateRoutes(route.children2, data.url)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(this.role.routes)
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认是否删除此角色?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const result = await deleteRole(row.id)
        this.rolesList.splice($index, 1)
        this.$message({
          type: 'success',
          message: result.message
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.url)

        // recursive child routes
        if (route.children2) {
          route.children2 = this.generateTree(route.children2, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children2 && route.children2.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },
    confirmRole() {
      const isEdit = this.dialogType === 'edit'

      const root_keys = this.$refs.tree.getCheckedKeys()
      const left_keys = this.$refs.tree.getHalfCheckedKeys()
      this.role.routes = root_keys.concat(left_keys)

      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (isEdit) {
            updateRole(this.role.id, this.role).then((result) => {
              const index = this.rolesList.findIndex(v => v.id === this.role.id)
              this.rolesList.splice(index, 1, this.role)
              this.$notify({
                title: 'Success',
                message: result.message,
                type: 'success'
              })
            })
          } else {
            addRole(this.role).then((result) => {
              this.role.id = result.data.id
              this.rolesList.push(this.role)
              this.$notify({
                title: 'Success',
                message: result.message,
                type: 'success'
              })
            })
          }
          this.dialogVisible = false
        }
      })
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
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
}

</style>
