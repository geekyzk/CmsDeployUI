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
        <el-table ref="SystemParamTable" v-loading="loading" :data="data" border fit highlight-current-row style="width: 100%;" @sort-change="sortSignTime" @row-dblclick="openDetails">
          <!-- 操作 -->
          <el-table-column align="center" :label="$t('table.actions')" width="80px" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="text" title="编辑" @click="handleUpdate(scope.row)"><i class="el-icon-edit" /></el-button>
              <el-button type="text" title="删除" @click="deleteData(scope.row.id)"><i class="el-icon-delete" /></el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" align="center" width="50" />
          <el-table-column prop="paramName" label="" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.paramName }}
            </template>
          </el-table-column>
          <el-table-column prop="paramValue" label="" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.paramValue }}
            </template>
          </el-table-column>
          <el-table-column prop="paramCode" label="" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.paramCode }}
            </template>
          </el-table-column>
          <el-table-column prop="profile" label="" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.profile }}
            </template>
          </el-table-column>
          <el-table-column prop="state" label="" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.state }}
            </template>
          </el-table-column>
          <el-table-column prop="absIndex" label="" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.absIndex }}
            </template>
          </el-table-column>
          <el-table-column prop="memo" label="" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.memo }}
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
      <el-form ref="systemParamForm" class="form-add" :model="systemParamTemp" :rules="rules" label-width="100px" style="width: 100%; padding-left:10px;padding-right:10px">
        <el-form-item label="" prop="paramName">
          <el-input v-model="systemParamTemp.paramName" style="width:100%" />
        </el-form-item>
        <el-form-item label="" prop="paramValue">
          <el-input v-model="systemParamTemp.paramValue" style="width:100%" />
        </el-form-item>
        <el-form-item label="" prop="paramCode">
          <el-input v-model="systemParamTemp.paramCode" style="width:100%" />
        </el-form-item>
        <el-form-item label="" prop="profile">
          <el-input v-model="systemParamTemp.profile" style="width:100%" />
        </el-form-item>
        <el-form-item label="" prop="state">
          <el-input v-model="systemParamTemp.state" style="width:100%" />
        </el-form-item>
        <el-form-item label="" prop="absIndex">
          <el-input v-model="systemParamTemp.absIndex" style="width:100%" />
        </el-form-item>
        <el-form-item label="" prop="memo">
          <el-input v-model="systemParamTemp.memo" style="width:100%" />
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
        <el-form-item label="">
          <span> {{ showData.paramName }}</span>
        </el-form-item>
        <el-form-item label="">
          <span> {{ showData.paramValue }}</span>
        </el-form-item>
        <el-form-item label="">
          <span> {{ showData.paramCode }}</span>
        </el-form-item>
        <el-form-item label="">
          <span> {{ showData.profile }}</span>
        </el-form-item>
        <el-form-item label="">
          <span> {{ showData.state }}</span>
        </el-form-item>
        <el-form-item label="">
          <span> {{ showData.absIndex }}</span>
        </el-form-item>
        <el-form-item label="">
          <span> {{ showData.memo }}</span>
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
import { listSystemParam, createSystemParam, updateSystemParam, deleteSystemParam } from '@/api/SystemParamApi'
import waves from '@/directive/waves'
import { formatDate } from '@/utils'

export default {
  name: 'SystemParam',
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
        update: '编辑系统参数',
        create: '添加系统参数'
      },
      showData: '',
      listParams: {
        page: 1,
        size: 10,
        'name.contains': undefined
      },
      data: [],
      systemParamTemp: {
        paramName: undefined,
        paramValue: undefined,
        paramCode: undefined,
        profile: undefined,
        state: undefined,
        absIndex: undefined,
        memo: undefined,
        id: undefined
      },
      rules: {
        paramName: [{ required: true, message: '为必须参数', trigger: 'change' }],
        paramValue: [{ required: true, message: '为必须参数', trigger: 'change' }],
        paramCode: [{ required: true, message: '为必须参数', trigger: 'change' }],
        profile: [{ required: true, message: '为必须参数', trigger: 'change' }],
        state: [{ required: true, message: '为必须参数', trigger: 'change' }],
        absIndex: [{ required: true, message: '为必须参数', trigger: 'change' }],
        memo: [{ required: true, message: '为必须参数', trigger: 'change' }]
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
      listSystemParam(params).then(response => {
        this.loading = false
        this.data = response.data.data
        this.total = response.data.totalSize
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
    resetsystemParamTemp() {
      this.systemParamTemp = {
        paramName: undefined,
        paramValue: undefined,
        paramCode: undefined,
        profile: undefined,
        state: undefined,
        absIndex: undefined,
        memo: undefined,
        id: undefined
      }
    },
    handleCreate() {
      this.resetsystemParamTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['systemParamForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['systemParamForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          createSystemParam(this.systemParamTemp).then(response => {
            this.buttonLoading = false
            if (response.data.code === -1) {
              this.$message({
                title: '失败',
                message: response.data.message,
                type: 'error'
              })
            } else {
              this.list()
              this.dialogFormVisible = false
              this.$message({
                title: '成功',
                message: response.data.message,
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
      Object.assign(this.systemParamTemp, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['systemParamForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['systemParamForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          updateSystemParam(this.systemParamTemp.id, this.systemParamTemp).then(response => {
            this.buttonLoading = false
            if (response.data.code === -1) {
              this.$message({
                title: '失败',
                message: response.data.message,
                type: 'error'
              })
            } else {
              this.list()
              this.dialogFormVisible = false
              this.$message({
                title: '成功',
                message: response.data.message,
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
      this.$confirm('确认删除该系统参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSystemParam(id).then(response => {
          if (response.data.code === -1) {
            this.$message({
              title: '失败',
              message: response.data.message,
              type: 'error'
            })
          } else {
            this.list()
            this.$message({
              title: '成功',
              message: response.data.message,
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
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '创建时间',
          '更新时间']
        const filterVal = ['id',
          'paramName',
          'paramValue',
          'paramCode',
          'profile',
          'state',
          'absIndex',
          'memo',
          'createAt',
          'updateAt']
        const params = Object.assign({}, this.listParams)
        params.size = this.total
        listSystemParam(params).then(response => {
          this.exportList = response.data.data
          const data = this.formatJson(filterVal, this.exportList)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '系统参数数据表格'
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
