<template>
  <div class="fileUpload">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="搜索条件">
        <el-select v-model="formInline.region" placeholder="菜单按钮">
          <el-option label="所有" value=""></el-option>
          <el-option label="课题组概况" value="课题组概况"></el-option>
          <el-option label="新闻动态" value="新闻动态"></el-option>
          <el-option label="基金项目" value="基金项目"></el-option>
          <el-option label="学术成果" value="学术成果"></el-option>
          <el-option label="文娱体育" value="文娱体育"></el-option>
          <el-option label="资源共享" value="资源共享"></el-option>
          <el-option label="通知公告" value="通知公告"></el-option>
          <el-option label="科研团队" value="科研团队"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标题搜索">
        <el-input v-model="formInline.user" placeholder="请输入标提搜索"></el-input>
      </el-form-item>
      <el-form-item label="内容搜索">
        <el-input v-model="formInline.content" placeholder="请输入内容搜索"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <router-link to="/fileUpload/edit"><el-button type="primary">新增</el-button></router-link>
        <el-button type="primary" @click="onResize">清空</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="tableData"
      border
      style="width: 100%">
      <el-table-column
        type="index"
        label="序号"
        width="50">
      </el-table-column>
      <el-table-column
        prop="title"
        label="发布标题"
        width="200">
      </el-table-column>
      <el-table-column
        prop="content"
        label="发布内容"
        width="250">
      </el-table-column>
      <el-table-column
        prop="path"
        label="发布路径"
        width="120">
      </el-table-column>
      <el-table-column
        prop="create_name"
        label="发布人"
        width="100">
      </el-table-column>
      <el-table-column
        prop="date"
        label="发布时间"
        width="180">
      </el-table-column>
      <el-table-column
        label="操作"
        width="150">
        <template slot-scope="scope">
          <router-link :to="'/fileUpload/edit?id=' + scope.row.id + '&view=1'"><el-button type="text" size="small">查看</el-button></router-link>
          <router-link :to="'/fileUpload/edit?id=' + scope.row.id"><el-button type="text" size="small">编辑</el-button></router-link>
          <el-button type="text" size="small" @click.stop.prevent="deleteFile(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        background
        @size-change="sizeChange"
        @current-change="currentChange"
        layout="prev, pager, next"
        :total="totalPage">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      formInline: {
        user: '',
        region: ''
      },
      tableData: [],
      totalPage: 0, // 总页数
      currentPage: null, // 当前第几页
      sizePage: 10, // 每页显示条数
      tableDataAll: [] // 所有数据,前端分页
    }
  },
  created () {
    $.ajax({
      url: origin + 'admin/files',
      type: 'GET',
      dataType: 'json',
      success: res => {
        this.tableDataAll = res.data.map(item => {
          item.date = this.formatDate(Number(item.date))
          return item;
        })
        this.totalPage = this.tableDataAll.length
        // 初始化当前页
        this.currentPage = 1
      }
    })
  },
  watch: {
    currentPage (val) {
      this.onSearch(val)
    }
  },
  methods: {
    /**
     * 删除文件
     * @param id 文件id
     */
    deleteFile (id) {
      $.ajax({
        url: origin + 'deleteFile',
        type: 'GET',
        data: {
          id: id
        },
        dataType: 'json',
        success: res => {
          if (res.errorCode === 1) {
            this.$message({
              message: '恭喜你，操作成功',
              type: 'success'
            });
            this.tableData = this.tableData.filter(item => {
              if (item.id === id) {
                return false;
              }
              return item;
            })
          }
        }
      })
    },
    // 
    sizeChange(val) {
      console.log('size', val)
    },
    // 切换页数
    currentChange(val) {
      // val--;
      this.currentPage = val;
      
      console.log('currnet', val)
    },
    filterList(list) {
      let arr = []; // 临时数组
      let start = 0,
          val = this.currentPage,
          end = 0;
          
      if (this.currentPage * this.sizePage < list.length) {
        start = (val - 1) * this.sizePage
        end  = val * this.sizePage
      } else {
        start = (val - 1) * this.sizePage
        end  = list.length;
      }
      console.log(this.currentPage, end)
      for (var i = start; i < end; i++) {
        if (list[i]) {
          arr.push(list[i])
        }
      }
      // console.log(arr)
      // 传给显示tableData
      this.tableData = arr;
      
    },
    onSearch(pageIndex) {
      let titleFilter = this.formInline.user;
      let region = this.formInline.region;
      let content = this.formInline.content
      let self = this;
      // init
      this.currentPage = typeof pageIndex == 'number' ? pageIndex : 1;
      this.tableData = [];
      setTimeout(() => {
        let filterTableData = self.tableDataAll.filter((item) => {
          if ((titleFilter ? (item.title.indexOf(titleFilter) > -1) : true) && (region ? region === item.path : true) && (content ? (item.content.indexOf(content) > -1) : true)) {
            return item;
          }
          return false;
        })
        this.totalPage = filterTableData.length
        // console.log(filterTableData,11)
        this.filterList(filterTableData)
      }, 0)
    },
    formatDate(dateObj) {
      const d = new Date(dateObj);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    },
    onResize() {
      this.formInline.region = '';
      this.formInline.user = '';
      this.formInline.content = '';
    },
    handleClick(row) {
      console.log(row);
    }
  }
}
</script>

<style scoped>
  .fileUpload {
    padding: 12px;
  }
  .pagination {
    margin-top: 10px;
  }
  .pagination:after {
    content: '';
    display: block;
    clear: both;
  }
  .pagination > div {
    float: right;
  }
  
</style>
