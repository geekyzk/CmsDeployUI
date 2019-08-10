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
        <el-table ref="SiteColumnTable" v-loading="loading" :data="data" border fit highlight-current-row style="width: 100%;" @sort-change="sortSignTime" @row-dblclick="openDetails">
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

          <!-- <el-table-column prop="icon" label="栏目图标" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.icon }}
            </template>
          </el-table-column> -->
          <el-table-column prop="rank" label="排序" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.rank }}
            </template>
          </el-table-column>
          <el-table-column prop="used" label="状态" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.used">显示</el-tag>
              <el-tag v-else type="danger">不显示</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ siteColumnTypeMaps[scope.row.type] }}
            </template>
          </el-table-column>
          <el-table-column prop="codeName" label="栏目代码" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.codeName }}
            </template>
          </el-table-column>
          <el-table-column prop="listNums" label="显示文章数" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.listNums }}
            </template>
          </el-table-column>
          <el-table-column prop="url" label="链接地址" align="center">
            <template slot-scope="scope">
              {{ scope.row.url }}
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
      <el-form ref="siteColumnForm" class="form-add" :model="siteColumnTemp" :rules="rules" label-width="100px" style="width: 100%; padding-left:10px;padding-right:10px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="siteColumnTemp.name" style="width:100%" />
        </el-form-item>
        <el-form-item label="栏目代码" prop="codeName">
          <el-input v-model="siteColumnTemp.codeName" style="width:100%" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="siteColumnTemp.type">
            <el-option v-for="(label,value) in siteColumnTypeMaps" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="siteColumnTemp.type === 'LINK'" label="链接地址" prop="url">
          <el-input v-model="siteColumnTemp.url" style="width:100%" />
        </el-form-item>

        <el-form-item v-show="siteColumnTemp.type === 'LIST'" label="列表模版" prop="listTemplatePageId">
          <el-select v-model="siteColumnTemp.listTemplatePageId">
            <el-option v-for="item in listTemplatePageTypeData" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="siteColumnTemp.type === 'DETAIL' || siteColumnTemp.type === 'LIST'" label="详情模版" prop="detailTemplatePageId">
          <el-select v-model="siteColumnTemp.detailTemplatePageId">
            <el-option v-for="item in detailTemplatePageTypeData" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="栏目图标" prop="icon">
          <el-input v-model="siteColumnTemp.icon" style="width:100%"></el-input>
        </el-form-item> -->
        <el-form-item label="排序" prop="rank">
          <el-input-number v-model="siteColumnTemp.rank" style="width:100%" />
        </el-form-item>
        <el-form-item label="启用状态" prop="used">
          <el-switch
            v-model="siteColumnTemp.used"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>

        <el-form-item v-show="siteColumnTemp.Type === 'LIST'" label="每页文章数" prop="listNums">
          <el-input v-model="siteColumnTemp.listNums" style="width:100%" />
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
        <el-form-item label="链接地址">
          <span> {{ showData.url }}</span>
        </el-form-item>
        <el-form-item label="栏目图标">
          <span> {{ showData.icon }}</span>
        </el-form-item>
        <el-form-item label="排序">
          <span> {{ showData.rank }}</span>
        </el-form-item>
        <el-form-item label="启用状态">
          <span> {{ showData.used }}</span>
        </el-form-item>
        <el-form-item label="类型">
          <span> {{ showData.type }}</span>
        </el-form-item>
        <el-form-item label="栏目代码">
          <span> {{ showData.codeName }}</span>
        </el-form-item>
        <el-form-item label="显示文章数">
          <span> {{ showData.listNums }}</span>
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
import { listSiteColumn, createSiteColumn, updateSiteColumn, deleteSiteColumn } from '@/api/SiteColumnApi'
import { listTemplatePage } from '@/api/TemplatePageApi'
import waves from '@/directive/waves'
import { formatDate } from '@/utils'

export default {
  name: 'SiteColumn',
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
        update: '编辑站点栏目',
        create: '添加站点栏目'
      },
      showData: '',
      listParams: {
        page: 1,
        size: 10,
        'name.contains': undefined
      },
      data: [],
      listTemplatePageTypeData: [],
      detailTemplatePageTypeData: [],
      siteColumnTypeMaps: {
        'DETAIL': '详情',
        'LIST': '文章列表',
        'LINK': '外链'
      },
      siteColumnTemp: {
        name: undefined,
        url: undefined,
        icon: undefined,
        rank: undefined,
        used: true,
        type: 'LIST',
        codeName: undefined,
        listNums: undefined,
        listTemplatePageId: undefined,
        detailTemplatePageId: undefined,
        id: undefined
      },
      rules: {
        name: [{ required: true, message: '名称为必须参数', trigger: 'change' }],
        // url: [{ required: true, message: '链接地址为必须参数', trigger: 'change' }],
        icon: [{ required: true, message: '栏目图标为必须参数', trigger: 'change' }],
        rank: [{ required: true, message: '排序为必须参数', trigger: 'change' }],
        used: [{ required: true, message: '启用状态为必须参数', trigger: 'change' }],
        type: [{ required: true, message: '类型为必须参数', trigger: 'change' }],
        codeName: [{ required: true, message: '栏目代码为必须参数', trigger: 'change' }]
        // listNums: [{ required: true, message: '显示文章数为必须参数', trigger: 'change' }],
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
      listSiteColumn(params).then(response => {
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
    resetsiteColumnTemp() {
      this.siteColumnTemp = {
        name: undefined,
        url: undefined,
        icon: undefined,
        rank: undefined,
        used: true,
        type: 'LIST',
        codeName: undefined,
        listNums: undefined,
        listTemplatePageId: undefined,
        id: undefined
      }
    },
    handleCreate() {
      this.resetsiteColumnTemp()
      listTemplatePage({ size: 100, 'templatePageType.equals': 'LIST' }).then(resp => {
        this.listTemplatePageTypeData = resp.data
      })
      listTemplatePage({ size: 100, 'templatePageType.equals': 'DETAIL' }).then(resp => {
        this.detailTemplatePageTypeData = resp.data
      })
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['siteColumnForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['siteColumnForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          createSiteColumn(this.siteColumnTemp).then(response => {
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
      Object.assign(this.siteColumnTemp, row)
      this.dialogStatus = 'update'
      listTemplatePage({ size: 100, 'templatePageType.equals': 'LIST' }).then(resp => {
        this.listTemplatePageTypeData = resp.data
      })
      listTemplatePage({ size: 100, 'templatePageType.equals': 'DETAIL' }).then(resp => {
        this.detailTemplatePageTypeData = resp.data
      })
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['siteColumnForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['siteColumnForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          updateSiteColumn(this.siteColumnTemp.id, this.siteColumnTemp).then(response => {
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
      this.$confirm('确认删除该站点栏目, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSiteColumn(id).then(response => {
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
          '链接地址',
          '栏目图标',
          '排序',
          '启用状态',
          '类型',
          '栏目代码',
          '显示文章数',
          '创建时间',
          '更新时间']
        const filterVal = ['id',
          'name',
          'url',
          'icon',
          'rank',
          'used',
          'type',
          'codeName',
          'listNums',
          'createAt',
          'updateAt']
        const params = Object.assign({}, this.listParams)
        params.size = this.total
        listSiteColumn(params).then(response => {
          this.exportList = response.data
          const data = this.formatJson(filterVal, this.exportList)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '站点栏目数据表格'
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
