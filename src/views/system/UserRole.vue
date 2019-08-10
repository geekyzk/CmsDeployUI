<template>
  <div class="app-container">
    <!-- 查询参数过滤 -->
    <div class="filter-container">
      <el-row :gutter="10">
        <el-form>
          <el-col :span="2">
            <el-button class="filter-item" style="width:100%;padding: 10px 0px;" type="primary" icon="el-icon-plus" @click="handleCreate">{{ $t('table.add') }}</el-button>
          </el-col>
          <el-col :span="2">
            <el-button :disabled="total == 0" type="primary" style="width:100%;padding: 10px 0px;" :loading="downloadLoading" icon="el-icon-download" @click="handleDownload">{{ $t('table.export') }}</el-button>
          </el-col>
          <el-col :span="2">
            <el-button v-waves class="filter-item" style="width:100%;padding: 10px 0px;" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
          </el-col>
        </el-form>
      </el-row>
    </div>
    <el-row>
      <div class="chart-container">
        <el-table ref="UserRoleTable" v-loading="loading" :data="data" border fit highlight-current-row style="width: 100%;" @sort-change="sortSignTime" @row-dblclick="openDetails">
          <!-- 操作 -->
          <el-table-column align="center" :label="$t('table.actions')" width="80px" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="text" title="编辑" @click="handleUpdate(scope.row)"><i class="el-icon-edit" /></el-button>
              <el-button type="text" title="删除" @click="deleteData(scope.row.id)"><i class="el-icon-delete" /></el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" align="center" width="50" />
          <el-table-column prop="name" label="名称" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column prop="createAt" label="创建时间" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.createAt | formatDate }}
            </template>
          </el-table-column>
          <el-table-column prop="updateAt" label="更新时间" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.updateAt | formatDate }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          :current-page="listParams.page"
          :page-sizes="pageSize"
          :page-size="listParams.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-row>

    <!-- 对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="48%" top="7vh">
      <el-form ref="userRoleForm" class="form-add" :model="userRoleTemp" :rules="rules" label-width="100px" style="width: 100%; padding-left:10px;padding-right:10px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="userRoleTemp.name" style="width:100%" />
        </el-form-item>
        <el-form-item label="菜单" prop="menus">
          <el-tree :data="systemMenuData"  
          node-key="id"
          show-checkbox
          default-expand-all
          ref="tree">
          </el-tree>
          
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" :loading="buttonLoading" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" :loading="buttonLoading" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogDetailVisible" title="详情" width="40%" top="7vh" style="width: 100%; padding-left:10px;padding-right:10px">
      <el-form ref="form" :model="showData" label-width="90px" label-position="left" style="padding-left: 20px">
        <el-form-item label="名称">
          <span> {{ showData.name }}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ showData.createAt | formatDate }}</span>
        </el-form-item>
        <el-form-item label="更新时间">
          <span>{{ showData.updateAt | formatDate }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listUserRole, createUserRole, updateUserRole, deleteUserRole } from '@/api/UserRoleApi'
import { listSystemMainMenu } from '@/api/SystemMainMenuApi'
import waves from '@/directive/waves'
import { formatDate } from '@/utils'

export default {
  name: 'UserRole',
  directives: {
    waves
  },
  data() {
    return {
      loading: false,
      buttonLoading: false,
      pageSize: [10, 20, 30, 50],
      downloadLoading: false,
      dialogFormVisible: false,
      dialogDetailVisible: false,
      total: null,
      dialogStatus: '',
      textMap: {
        update: '编辑用户角色',
        create: '添加用户角色'
      },
      showData: '',
      listParams: {
        page: 1,
        size: 10,
        'name.contains': undefined
      },
      data: [],
      systemMenuData: [],
      userRoleTemp: {
        name: undefined,
        menuIds: [],
        id: undefined
      },
      rules: {
        name: [{ required: true, message: '名称为必须参数', trigger: 'change' }]
      }
    }
  },
  created() {
    this.list()
  },
  methods: {
    list() {
      const params = {
        page: this.listParams.page,
        size: this.listParams.size,
        'sort': this.listParams['sort'] === '' ? null : this.listParams['sort']
      }
      this.loading = true
      listUserRole(params).then(response => {
        this.loading = false
        this.data = response.data
        this.total = response.totalSize
      })
    },
    sortSignTime(column) {
      if (column.order === 'ascending') {
        this.listParams['sort'] = `${column.prop},asc`
      } else if (column.order === 'descending') {
        this.listParams['sort'] = `${column.prop},desc`
      } else {
        this.listParams['sort'] = null
      }
      this.page = 1
      this.list()
    },
    openDetails(row) {
      this.showData = row
      this.dialogDetailVisible = true
    },
    resetuserRoleTemp() {
      this.userRoleTemp = {
        name: undefined,
        menuIds: [],
        id: undefined
      }
    },
    initSystemMenuData() {
      listSystemMainMenu({size: 100}).then(resp => {
        let tempMenus = []
        resp.data.forEach(item => {
          if (item.isRoot) {
            tempMenus.push({
              id: item.id,
              label: item.name,
              children: []
            })
          }
        })
        resp.data.forEach(item => {
          if (!item.isRoot) {
            tempMenus.forEach(i => {
              if (i.id === item.pid) {
                i.children.push({
                   id: item.id,
                    label: item.name,
                    children: []
                })
              }
            })
          }
        })
        console.log(tempMenus)
        this.systemMenuData = tempMenus
      })
    },
    handleCreate() {
      this.resetuserRoleTemp()
      this.initSystemMenuData()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['userRoleForm'].clearValidate()
        this.$refs.tree.setCheckedKeys(this.userRoleTemp.menuIds)
      })
    },
    createData() {
      this.$refs['userRoleForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          this.userRoleTemp.menuIds = this.$refs.tree.getCheckedKeys()
          createUserRole(this.userRoleTemp).then(response => {
            this.buttonLoading = false
            if (response.code === -1) {
              this.$message({
                title: '失败',
                message: response.message,
                type: 'error'
              })
            } else {
              this.list()
              this.dialogFormVisible = false
              this.$message({
                title: '成功',
                message: response.message,
                type: 'success'
              })
            }
          }).catch(() => {
            this.$message({
              title: '失败',
              message: '请求数据失败',
              type: 'error'
            })
            this.buttonLoading = false
          })
        }
      })
    },
    handleUpdate(row) {
      Object.assign(this.userRoleTemp, row)
      this.initSystemMenuData()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['userRoleForm'].clearValidate()
        this.$refs.tree.setCheckedKeys(row.menuIds)
      })
    },
    updateData() {
      this.$refs['userRoleForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          this.userRoleTemp.menuIds = this.$refs.tree.getCheckedKeys()
          updateUserRole(this.userRoleTemp.id, this.userRoleTemp).then(response => {
            this.buttonLoading = false
            if (response.code === -1) {
              this.$message({
                title: '失败',
                message: response.message,
                type: 'error'
              })
            } else {
              this.list()
              this.dialogFormVisible = false
              this.$message({
                title: '成功',
                message: response.message,
                type: 'success'
              })
            }
          }).catch(() => {
            this.$message({
              title: '失败',
              message: '更新数据失败',
              type: 'error'
            })
            this.buttonLoading = false
          })
        }
      })
    },
    deleteData(id) {
      this.$confirm('确认删除该用户角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUserRole(id).then(response => {
          if (response.code === -1) {
            this.$message({
              title: '失败',
              message: response.message,
              type: 'error'
            })
          } else {
            this.list()
            this.$message({
              title: '成功',
              message: response.message,
              type: 'success'
            })
          }
        }).catch(() => {
          this.$message({
            title: '失败',
            message: '删除数据失败',
            type: 'error'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleFilter() {
      this.listParams.page = 1
      this.list()
    },
    handleSizeChange(val) {
      this.listParams.size = val
      this.list()
    },
    handleCurrentChange(val) {
      this.listParams.page = val
      this.list()
    },
    // 导出数据为 excel
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['记录编号',
          '名称',
          '创建时间',
          '更新时间']
        const filterVal = ['id',
          'name',
          'createAt',
          'updateAt']
        const params = Object.assign({}, this.listParams)
        params.size = this.total
        listUserRole(params).then(response => {
          this.exportList = response.data
          const data = this.formatJson(filterVal, this.exportList)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '用户角色数据表格'
          })
          this.downloadLoading = false
        })
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'createAt' || j === 'updateAt') {
          return formatDate(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>

<style scoped>
</style>
