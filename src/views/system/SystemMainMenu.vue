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
        <el-table ref="SystemMainMenuTable" v-loading="loading" :data="data" border fit highlight-current-row style="width: 100%;" @sort-change="sortSignTime" @row-dblclick="openDetails">
          <!-- 操作 -->
          <el-table-column align="center" :label="$t('table.actions')" width="80px" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="text" title="编辑" @click="handleUpdate(scope.row)"><i class="el-icon-edit" /></el-button>
              <el-button type="text" title="删除" @click="deleteData(scope.row.id)"><i class="el-icon-delete" /></el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" align="center" width="50" />
          <el-table-column prop="name" label="名称" align="center">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column prop="pid" label="父菜单" align="center">
            <template slot-scope="scope">
              {{ scope.row.pName }}
            </template>
          </el-table-column>
          <el-table-column prop="icon" label="图标" align="center">
            <template slot-scope="scope">
              <i :class="scope.row.icon" />
            </template>
          </el-table-column>
          <el-table-column prop="absIndex" label="位置" align="center">
            <template slot-scope="scope">
              {{ scope.row.absIndex }}
            </template>
          </el-table-column>
          <el-table-column prop="menuPath" label="访问路径" align="center"></el-table-column>
          <el-table-column prop="menuComponentPath" label="组件路径" align="center"></el-table-column>
          <el-table-column prop="createAt" label="创建时间" align="center">
            <template slot-scope="scope">
              {{ scope.row.createAt | formatDate }}
            </template>
          </el-table-column>
          <el-table-column prop="updateAt" label="更新时间" align="center">
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
      <el-form ref="systemMainMenuForm" class="form-add" :model="systemMainMenuTemp" :rules="rules" label-width="100px" style="width: 100%; padding-left:10px;padding-right:10px">
        <el-row>
          <el-col :span="12">
             <el-form-item label="名称" prop="name">
                <el-input v-model="systemMainMenuTemp.name" style="width:100%" />
              </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="根菜单" prop="isRoot">
                <el-switch v-model="systemMainMenuTemp.isRoot" active-text="是" inactive-text="否">
                </el-switch>
              </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="父菜单" prop="pid" v-show="!systemMainMenuTemp.isRoot">
          <el-select v-model="systemMainMenuTemp.pid" placeholder="">
            <el-option v-for="item in rootMenuData"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="访问路径" prop="menuPath">
          <el-input v-model="systemMainMenuTemp.menuPath" style="width:100%" />
        </el-form-item>
        <el-form-item label="组件路径" prop="menuComponentPath">
          <el-input v-model="systemMainMenuTemp.menuComponentPath" style="width:100%" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="systemMainMenuTemp.icon" style="width:100%" />
        </el-form-item>
        <el-form-item label="位置" prop="absIndex">
          <el-input v-model="systemMainMenuTemp.absIndex" style="width:100%" />
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
        <el-form-item label="父菜单">
          <span> {{ showData.pid }}</span>
        </el-form-item>
        <el-form-item label="链接">
          <span> {{ showData.linkUrl }}</span>
        </el-form-item>
        <el-form-item label="图标">
          <span> {{ showData.icon }}</span>
        </el-form-item>
        <el-form-item label="位置">
          <span> {{ showData.absIndex }}</span>
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
import { listSystemMainMenu, createSystemMainMenu, updateSystemMainMenu, deleteSystemMainMenu } from '@/api/SystemMainMenuApi'
import waves from '@/directive/waves'
import { formatDate } from '@/utils'

export default {
  name: 'SystemMainMenu',
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
        update: '编辑系统菜单',
        create: '添加系统菜单'
      },
      showData: '',
      listParams: {
        page: 1,
        size: 10,
        'name.contains': undefined
      },
      data: [],
      rootMenuData: [],
      systemMainMenuTemp: {
        name: undefined,
        pid: undefined,
        linkUrl: undefined,
        icon: undefined,
        isRoot: true,
        absIndex: undefined,
        menuComponentPath: undefined,
        menuPath: undefined,
        id: undefined
      },
      rules: {
        name: [{ required: true, message: '名称为必须参数', trigger: 'change' }],
        icon: [{ required: true, message: '图标为必须参数', trigger: 'change' }],
        absIndex: [{ required: true, message: '位置为必须参数', trigger: 'change' }]
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
      listSystemMainMenu(params).then(response => {
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
    resetsystemMainMenuTemp() {
      this.systemMainMenuTemp = {
        name: undefined,
        pid: undefined,
        linkUrl: undefined,
        icon: undefined,
        isRoot: true,
        absIndex: undefined,
        menuComponentPath: undefined,
        menuPath: undefined,
        id: undefined
      }
    },
    initRootMenuData() {
      listSystemMainMenu({size: 100, 'isRoot.equals': true}).then(resp => {
        this.rootMenuData = resp.data
      })
    },
    handleCreate() {
      this.resetsystemMainMenuTemp()
      this.initRootMenuData()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['systemMainMenuForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['systemMainMenuForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          createSystemMainMenu(this.systemMainMenuTemp).then(response => {
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
      Object.assign(this.systemMainMenuTemp, row)
      this.initRootMenuData()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['systemMainMenuForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['systemMainMenuForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          updateSystemMainMenu(this.systemMainMenuTemp.id, this.systemMainMenuTemp).then(response => {
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
      this.$confirm('确认删除该系统菜单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSystemMainMenu(id).then(response => {
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
          '父菜单',
          '链接',
          '图标',
          '位置',
          '创建时间',
          '更新时间']
        const filterVal = ['id',
          'name',
          'pid',
          'linkUrl',
          'icon',
          'absIndex',
          'createAt',
          'updateAt']
        const params = Object.assign({}, this.listParams)
        params.size = this.total
        listSystemMainMenu(params).then(response => {
          this.exportList = response.data
          const data = this.formatJson(filterVal, this.exportList)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '系统菜单数据表格'
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
