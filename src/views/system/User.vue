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
          <!-- <el-col :span="2">
            <el-button v-waves class="filter-item" style="width:100%;padding: 10px 0px;" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
          </el-col> -->
        </el-form>
      </el-row>
    </div>
    <el-row>
      <div class="chart-container">
        <el-table ref="UserTable" v-loading="loading" :data="data" border fit highlight-current-row style="width: 100%;" @sort-change="sortSignTime" @row-dblclick="openDetails">
          <!-- 操作 -->
          <el-table-column align="center" :label="$t('table.actions')" width="80px" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="text" title="编辑" @click="handleUpdate(scope.row)"><i class="el-icon-edit" /></el-button>
              <el-button type="text" title="删除" @click="deleteData(scope.row.id)"><i class="el-icon-delete" /></el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" align="center" width="50" />
          <el-table-column prop="name" label="姓名" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column prop="sex" label="性别" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ sexMaps[scope.row.sex] }}
            </template>
          </el-table-column>
          <el-table-column prop="tel" label="电话" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.tel }}
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.email }}
            </template>
          </el-table-column>
          <el-table-column prop="idCard" label="身份证" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.idCard }}
            </template>
          </el-table-column>
          <el-table-column prop="activated" label="激活" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.activated" type="success">是</el-tag>
              <el-tag v-else type="danger">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="imageUrl" label="头像" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.imageUrl }}
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
      <el-form ref="userForm" class="form-add" :model="userTemp" :rules="rules" label-width="100px" style="width: 100%; padding-left:10px;padding-right:10px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="userTemp.name" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="userTemp.sex" placeholder="">
                <el-option v-for="(label,value) in sexMaps"
                  :key="value"
                  :label="label"
                  :value="value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="电话" prop="tel">
          <el-input v-model="userTemp.tel" style="width:100%" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userTemp.email" style="width:100%" />
        </el-form-item>
        <el-form-item label="身份证" prop="idCard">
          <el-input v-model="userTemp.idCard" style="width:100%" />
        </el-form-item>
         <el-form-item label="角色" prop="roleIds">
          <el-select v-model="userTemp.roleIds" placeholder="角色" multiple >
            <el-option v-for="item in userRoleData"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="激活" prop="activated">
          <el-switch
            v-model="userTemp.activated"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <!-- <el-form-item label="头像" prop="imageUrl">
          <el-input v-model="userTemp.imageUrl" style="width:100%" />
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" :loading="buttonLoading" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" :loading="buttonLoading" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogDetailVisible" title="详情" width="40%" top="7vh" style="width: 100%; padding-left:10px;padding-right:10px">
      <el-form ref="form" :model="showData" label-width="90px" label-position="left" style="padding-left: 20px">
        <el-form-item label="姓名">
          <span> {{ showData.name }}</span>
        </el-form-item>
        <el-form-item label="性别">
          <span> {{ showData.sex }}</span>
        </el-form-item>
        <el-form-item label="电话">
          <span> {{ showData.tel }}</span>
        </el-form-item>
        <el-form-item label="邮箱">
          <span> {{ showData.email }}</span>
        </el-form-item>
        <el-form-item label="身份证">
          <span> {{ showData.idCard }}</span>
        </el-form-item>
        <el-form-item label="密码">
          <span> {{ showData.password }}</span>
        </el-form-item>
        <el-form-item label="激活">
          <span> {{ showData.activated }}</span>
        </el-form-item>
        <el-form-item label="头像">
          <span> {{ showData.imageUrl }}</span>
        </el-form-item>
        <el-form-item label="超级管理员">
          <span> {{ showData.isRoot }}</span>
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
import { listUser, createUser, updateUser, deleteUser } from '@/api/UserApi'
import { listUserRole } from '@/api/UserRoleApi'

import waves from '@/directive/waves'
import { formatDate } from '@/utils'

export default {
  name: 'User',
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
        update: '编辑用户',
        create: '添加用户'
      },
      sexMaps: {
        1: '男',
        2: '女',
        3: '未知'
      },
      showData: '',
      listParams: {
        page: 1,
        size: 10,
        'name.contains': undefined
      },
      data: [],
      userRoleData: [],
      userTemp: {
        name: undefined,
        sex: undefined,
        tel: undefined,
        email: undefined,
        idCard: undefined,
        password: undefined,
        activated: undefined,
        imageUrl: undefined,
        isRoot: undefined,
        roleIds: [],
        id: undefined
      },
      rules: {
        name: [{ required: true, message: '姓名为必须参数', trigger: 'change' }],
        sex: [{ required: true, message: '性别为必须参数', trigger: 'change' }],
        tel: [{ required: true, message: '电话为必须参数', trigger: 'change' }],
        email: [{ required: true, message: '邮箱为必须参数', trigger: 'change' }],
        idCard: [{ required: true, message: '身份证为必须参数', trigger: 'change' }],
        password: [{ required: true, message: '密码为必须参数', trigger: 'change' }],
        activated: [{ required: true, message: '激活为必须参数', trigger: 'change' }],
        imageUrl: [{ required: true, message: '头像为必须参数', trigger: 'change' }],
        isRoot: [{ required: true, message: '超级管理员为必须参数', trigger: 'change' }]
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
      listUser(params).then(response => {
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
    initUserRoleData() {
      listUserRole({size: 100}).then(resp => {
        this.userRoleData = resp.data
      })
    },
    openDetails(row) {
      this.showData = row
      this.dialogDetailVisible = true
    },
    resetuserTemp() {
      this.userTemp = {
        name: undefined,
        sex: undefined,
        tel: undefined,
        email: undefined,
        idCard: undefined,
        password: undefined,
        roleIds: [],
        activated: undefined,
        imageUrl: undefined,
        isRoot: undefined,
        id: undefined
      }
    },
    handleCreate() {
      this.resetuserTemp()
      this.initUserRoleData()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['userForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['userForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          createUser(this.userTemp).then(response => {
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
      Object.assign(this.userTemp, row)
      this.initUserRoleData()
      this.userTemp.roleIds = row.userRoles.map(item => {return item.id})
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['userForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['userForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          updateUser(this.userTemp.id, this.userTemp).then(response => {
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
      this.$confirm('确认删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(id).then(response => {
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
          '姓名',
          '性别',
          '电话',
          '邮箱',
          '身份证',
          '密码',
          '激活',
          '头像',
          '超级管理员',
          '创建时间',
          '更新时间']
        const filterVal = ['id',
          'name',
          'sex',
          'tel',
          'email',
          'idCard',
          'password',
          'activated',
          'imageUrl',
          'isRoot',
          'createAt',
          'updateAt']
        const params = Object.assign({}, this.listParams)
        params.size = this.total
        listUser(params).then(response => {
          this.exportList = response.data
          const data = this.formatJson(filterVal, this.exportList)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '用户数据表格'
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
