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
            <el-button class="filter-item" style="width:100%;padding: 10px 0px;"  type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
          </el-col> -->
        </el-form>
      </el-row>
    </div>
    <el-row>
      <div class="chart-container">
        <el-table ref="TemplatePageTable" v-loading="loading" :data="data" border fit highlight-current-row style="width: 100%;" @sort-change="sortSignTime" @row-dblclick="openDetails">
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
          <el-table-column prop="templatePageType" label="类型" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ templagetPageTypeMaps[scope.row.templatePageType] }}
            </template>
          </el-table-column>
          <el-table-column prop="content" label="内容" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              <el-button type="text" title="编辑内容" @click="handleEditContent(scope.row)">编辑内容</el-button>
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
      <el-form ref="templatePageForm" class="form-add" :model="templatePageTemp" :rules="rules" label-width="100px" style="width: 100%; padding-left:10px;padding-right:10px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="templatePageTemp.name" style="width:100%" />
        </el-form-item>
        <el-form-item label="类型" prop="templatePageType">
          <el-select v-model="templatePageTemp.templatePageType">
            <el-option v-for="(label, value) in templagetPageTypeMaps" :key="value" :value="value" :label="label" />
          </el-select>
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
        <el-form-item label="类型">
          <span> {{ showData.templatePageType }}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ showData.createAt | formatDate }}</span>
        </el-form-item>
        <el-form-item label="更新时间">
          <span>{{ showData.updateAt | formatDate }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog :visible.sync="dialogEditContentVisible" title="代码编辑" width="90%" top="7vh" style="width: 100%; padding-left:10px;padding-right:10px">
      <!-- <codemirror v-model="editContentData"></codemirror> -->
      <json-editor ref="jsonEditor" v-model="editContentData" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogEditContentVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" :loading="buttonLoading" @click="updateTemplateContent">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listTemplatePage, createTemplatePage, updateTemplatePage, deleteTemplatePage } from '@/api/TemplatePageApi'
import waves from '@/directive/waves'
import { formatDate } from '@/utils'
import { codemirror } from 'vue-codemirror-lite'

import JsonEditor from '@/components/JsonEditor'

export default {
  name: 'TemplatePage',
  directives: {
    waves
  },
  components: {
    codemirror,
    JsonEditor
  },
  data() {
    return {
      loading: false,
      buttonLoading: false,
      pageSize: [10, 20, 30, 50],
      downloadLoading: false,
      dialogFormVisible: false,
      dialogDetailVisible: false,
      dialogEditContentVisible: false,
      total: null,
      dialogStatus: '',
      textMap: {
        update: '编辑模版配置',
        create: '添加模版配置'
      },
      showData: '',
      templagetPageTypeMaps: {
        'INDEX': '首页',
        'LIST': '列表页',
        'DETAIL': '文章页',
        'SEARCH': '搜索页'
      },
      listParams: {
        page: 1,
        size: 10,
        'name.contains': undefined
      },
      data: [],
      editContentData: 'const str = "hello world"',
      templatePageTemp: {
        content: undefined,
        name: undefined,
        templatePageType: undefined,
        content: undefined,
        id: undefined
      },
      rules: {
        name: [{ required: true, message: '名称为必须参数', trigger: 'change' }],
        templatePageType: [{ required: true, message: '类型为必须参数', trigger: 'change' }],
        content: [{ required: true, message: '内容为必须参数', trigger: 'change' }]
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
      listTemplatePage(params).then(response => {
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
    handleEditContent(row) {
      this.templatePageTemp = row
      this.editContentData = row.content
      this.dialogEditContentVisible = true
    },
    openDetails(row) {
      this.showData = row
      this.dialogDetailVisible = true
    },
    resettemplatePageTemp() {
      this.templatePageTemp = {
        name: undefined,
        templatePageType: undefined,
        content: undefined,
        id: undefined
      }
    },
    handleCreate() {
      this.resettemplatePageTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['templatePageForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['templatePageForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          createTemplatePage(this.templatePageTemp).then(response => {
            this.buttonLoading = false
            if (response.data.code === -1) {
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
      Object.assign(this.templatePageTemp, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['templatePageForm'].clearValidate()
      })
    },
    updateTemplateContent() {
      const reqData = {
        content: this.editContentData
      }
      updateTemplatePage(this.templatePageTemp.id, reqData).then(response => {
        this.buttonLoading = false
        if (response.code === -1) {
          this.$message({
            title: '失败',
            message: response.message,
            type: 'error'
          })
        } else {
          this.list()
          this.dialogEditContentVisible = false
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
    },
    updateData() {
      this.$refs['templatePageForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          updateTemplatePage(this.templatePageTemp.id, this.templatePageTemp).then(response => {
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
      this.$confirm('确认删除该模版配置, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTemplatePage(id).then(response => {
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
          '名称',
          '类型',
          // '内容',
          '创建时间',
          '更新时间']
        const filterVal = ['id',
          'name',
          'templatePageType',
          // 'content',
          'createAt',
          'updateAt']
        const params = Object.assign({}, this.listParams)
        params.size = this.total
        listTemplatePage(params).then(response => {
          this.exportList = response.data.data
          const data = this.formatJson(filterVal, this.exportList)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '模版配置数据表格'
          })
          this.downloadLoading = false
        })
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'createAt' || j === 'updateAt') {
          return formatDate(v[j])
        } else if (j === 'templatePageType') {
          return this.templagetPageTypeMaps(v[j])
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
