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
        <el-table ref="NewsTable" v-loading="loading" :data="data" border fit highlight-current-row style="width: 100%;" @sort-change="sortSignTime" @row-dblclick="openDetails">
          <!-- 操作 -->
          <el-table-column align="center" :label="$t('table.actions')" width="80px" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="text" title="编辑" @click="handleUpdate(scope.row)"><i class="el-icon-edit" /></el-button>
              <el-button type="text" title="删除" @click="deleteData(scope.row.id)"><i class="el-icon-delete" /></el-button>
              <el-link :href="baseUrl + '/' + scope.row.siteColumnCode + '/' + scope.row.id + '.html'" icon="el-icon-edit"  target="_blank"></el-link>
            </template>
          </el-table-column>
          <el-table-column type="index" align="center" width="50" />
          <el-table-column prop="title" label="标题" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.title }}
            </template>
          </el-table-column>
          <el-table-column prop="siteColumnName" label="栏目" align="center"></el-table-column>
          <el-table-column prop="pic" label="封面图片" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              <!-- {{ scope.row.pic }} -->
              <img :src="scope.row.pic" style="width:50px;height:50px"/>
            </template>
          </el-table-column>
          <el-table-column prop="intro" label="简介" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.intro }}
            </template>
          </el-table-column>
          <el-table-column prop="readNum" label="阅读数" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.readNum }}
            </template>
          </el-table-column>
          <!-- <el-table-column prop="type" label="类型" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.type }}
            </template>
          </el-table-column> -->
          <el-table-column prop="status" label="状态" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              <el-tag type="danger" v-if="!scope.row.status">未发布</el-tag>
              <el-tag v-else>已发布</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="发布者" align="center"></el-table-column>
          <!-- <el-table-column prop="createAt" label="创建时间" align="center" :sortable="'custom'">
            <template slot-scope="scope">
              {{ scope.row.createAt | formatDate }}
            </template>
          </el-table-column> -->
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="70%" top="7vh">
      <el-form ref="newsForm" class="form-add" :model="newsTemp" :rules="rules" label-width="100px" style="width: 100%; padding-left:10px;padding-right:10px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="newsTemp.title" style="width:100%" />
        </el-form-item>
        
        <el-form-item label="封面图片" prop="pic">
          <el-upload
            class="avatar-uploader"
            :action="uploadImageUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            >
            <img v-if="newsTemp.pic" :src="newsTemp.pic" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="简介" prop="intro">
          <el-input v-model="newsTemp.intro" type="textarea" style="width:100%" />
        </el-form-item>
        <el-form-item label="栏目" prop="siteColumnId">
          <el-select v-model="newsTemp.siteColumnId">
            <el-option v-for="item in siteColumnData" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="上架" prop="status">
          <el-switch
            v-model="newsTemp.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <tinymce v-model="newsTemp.content" :height="500" />
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" :loading="buttonLoading" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" :loading="buttonLoading" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogDetailVisible" title="详情" width="40%" top="7vh" style="width: 100%; padding-left:10px;padding-right:10px">
      <el-form ref="form" :model="showData" label-width="90px" label-position="left" style="padding-left: 20px">
        <el-form-item label="标题">
          <span> {{ showData.title }}</span>
        </el-form-item>
        <el-form-item label="封面图片">
          <span> {{ showData.pic }}</span>
        </el-form-item>
        <el-form-item label="简介">
          <span> {{ showData.intro }}</span>
        </el-form-item>
        <el-form-item label="阅读数">
          <span> {{ showData.readNum }}</span>
        </el-form-item>
        <el-form-item label="类型">
          <span> {{ showData.type }}</span>
        </el-form-item>
        <el-form-item label="状态">
          <span> {{ showData.status }}</span>
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
import { listNews, createNews, updateNews, deleteNews } from '@/api/NewsApi'
import { listNewsData } from '@/api/NewsDataApi'
import { listSiteColumn } from '@/api/SiteColumnApi'
import waves from '@/directive/waves'
import { formatDate } from '@/utils'
import Tinymce from '@/components/Tinymce'
import { getToken } from '@/utils/auth'

export default {
  name: 'News',
  directives: {
    waves
  },
  components: { Tinymce },
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
        update: '编辑文章',
        create: '添加文章'
      },
      baseUrl: process.env.VUE_APP_BASE_API,
      uploadImageUrl: process.env.VUE_APP_BASE_API + '/api/upload',
      uploadHeaders: {
        'Authorization': getToken()
      },
      showData: '',
      listParams: {
        page: 1,
        size: 10,
        'name.contains': undefined
      },
      data: [],
      siteColumnData: [],
      newsTemp: {
        title: undefined,
        pic: undefined,
        intro: undefined,
        readNum: undefined,
        type: undefined,
        status: undefined,
        content: '',
        siteColumnId: undefined,
        id: undefined
      },
      rules: {
        title: [{ required: true, message: '标题为必须参数', trigger: 'change' }],
        pic: [{ required: true, message: '封面图片为必须参数', trigger: 'change' }],
        intro: [{ required: true, message: '简介为必须参数', trigger: 'change' }],
        type: [{ required: true, message: '类型为必须参数', trigger: 'change' }],
        status: [{ required: true, message: '状态为必须参数', trigger: 'change' }],
        siteColumnId: [{ required: true, message: '栏目为必须参数', trigger: 'change' }]
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
      listNews(params).then(response => {
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
    resetnewsTemp() {
      this.newsTemp = {
        title: undefined,
        pic: undefined,
        intro: undefined,
        readNum: undefined,
        type: undefined,
        status: undefined,
        content: '',
        siteColumnId: undefined,
        id: undefined
      }
    },
    initSiteColumnData() {
      listSiteColumn({ size: 100 }).then(resp => {
        this.siteColumnData = resp.data
      })
    },
    handleAvatarSuccess(res, file) {
      console.log(res)
      this.newsTemp.pic = res.data.url
    },
    handleCreate() {
      this.resetnewsTemp()
      this.initSiteColumnData()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['newsForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['newsForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          createNews(this.newsTemp).then(response => {
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
      Object.assign(this.newsTemp, row)
      this.initSiteColumnData()
      listNewsData({'newsId.equals': row.id}).then(resp => {
        if (resp.totalSize > 0) {
          this.newsTemp.content = resp.data[0].content
        }
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['newsForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['newsForm'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          updateNews(this.newsTemp.id, this.newsTemp).then(response => {
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
      this.$confirm('确认删除该文章, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNews(id).then(response => {
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
          '标题',
          '封面图片',
          '简介',
          '阅读数',
          '类型',
          '状态',
          '创建时间',
          '更新时间']
        const filterVal = ['id',
          'title',
          'pic',
          'intro',
          'readNum',
          'type',
          'status',
          'createAt',
          'updateAt']
        const params = Object.assign({}, this.listParams)
        params.size = this.total
        listNews(params).then(response => {
          this.exportList = response.data
          const data = this.formatJson(filterVal, this.exportList)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '文章数据表格'
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
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
