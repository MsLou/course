<template>
  <div class="pic">
    <div class="pic-attr clearfix">
      <p class="pic-item-upload">上传照片</p>
      <p class="pic-item-text">照片说明</p>
      <p class="pic-item-sort">排序展示</p>
      <p class="pic-item-opt">操作</p>
    </div>
    <div class="pic-item clearfix" v-for="(item, index) in bannerData">
      <div class="pic-item-upload">
        <el-upload
          class="upload-demo"
          :data="{'sort': item.sort}"
          :before-upload="beforeUpload"
          :action="origin + 'admin/upload/'"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-success="onSuccess"
          :before-remove="beforeRemove"
          :on-exceed="handleExceed">
          <img :src="item.url" alt="" v-if="item.url" style="width: 150px;">
          <el-button size="small" type="primary" v-else>点击上传</el-button>
        </el-upload>
      </div>
      <div class="pic-item-text">
        <el-input
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          v-model="item.text">
        </el-input>
      </div>
      <div class="pic-item-sort">
        <span>{{ index + 1 }}</span>
      </div>
      <div class="pic-item-opt">
        <el-button type="primary" @click="resize(index)" size="small">清空</el-button>
      </div>
    </div>
    <p class="pic-tip el-upload__tip"> 支持图片类型：JPG PNG 尺寸：1200x500</p>
    <div class="pic-btn">
      <el-button @click="goList">放弃</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      fileList: [],
      origin: origin,
      dataUrl: {
        edit_file: origin + 'admin/edit_file'
      },
      fileTypes: ['jpg', 'png'],
      bannerData: [
        {
          text: '',
          filename: '',
          sort: 0
        },
        {
          text: '',
          filename: '',
          sort: 1
        },
        {
          text: '',
          filename: '',
          sort: 2
        },
        {
          text: '',
          filename: '',
          sort: 3
        },
        {
          text: '',
          filename: '',
          sort: 4
        },
        {
          text: '',
          filename: '',
          sort: 5
        }
      ]
    }
  },
  mounted () {
    this.getBannerData()
  },
  methods: {
    /**
     * 清空
     */
    resize (index) {
      this.bannerData[index].url = ''
      this.bannerData[index].text = ''
      this.bannerData[index].filename = ''
    },
    // 排序校验
    changeSort () {
    },
    // 返回列表
    goList () {
      this.$router.push('/')
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    // 文件上传前
    beforeUpload (file) {
      let status = false;
      // 类型校验
      this.fileTypes.every(item => {
        if (file.name.indexOf(`.${item}`) > -1) {
          status = 1;
          return false;
        }
        return true;
      })
      return status;
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
    onSuccess(res) {
      this.$set(this.bannerData[res.sort], 'filename', res.url)
      this.$set(this.bannerData[res.sort], 'url', `${origin}uploads/${res.url}`)
    },
    getBannerData() {
      $.ajax({
        url: origin + 'getBanner',
        type: 'GET',
        dataType: 'json',
        success: res => {
          if (res.errorCode === 1) {
            this.bannerData = res.data.map(item => {
              return {
                filename: item.url,
                sort: item.sort,
                url: item.url ? `${origin}uploads/${item.url}` : null,
                text: item.text || '',
              }
            })
          }
        }
      })
    },
    onSubmit() {
      let params = this.bannerData.filter(item => {
        return item;
      })
      $.ajax({
        url: origin + 'saveBanner',
        type: 'GET',
        data: {
          data: params
        },
        dataType: 'json',
        success: res => {
          if (res.errorCode === 1) {
            alert('修改成功')
            // window.location.reload()
            this.$message({
              message: '恭喜你，操作成功',
              type: 'success'
            });
          }
        }
      })
    }
  }
}
</script>

<style scoped>
  .pic {
     text-align: center;
     font-family: '微软雅黑';
     width: 800px;
  }
  .clearfix:after {
    content: '';
    display: block;
    clear: both;
  }
  .pic .pic-attr {
  }
  .pic .pic-item {
    margin-top: 20px;
    display: flex;
    display: -webkit-flex;
    align-items: center;
    -webkit-align-items: center;
    justify-content: center;
    -webkit-justify-content: center;
  }
  .pic .pic-item-upload {
    width: 200px;float: left;
  }
  .pic .pic-item-text {
    width: 400px;float: left;
  }
  .pic .pic-item-sort {
    width: 80px;float: left;margin-left: 20px;
  }
  .pic .pic-item-opt { width: 80px;float: left;margin-left: 20px; }
  .pic-btn { margin-top: 20px; }
  .pic-tip { color: #999;margin-top: 10px;text-align: left;padding-left: 60px;font-size: 12PX; }
</style>
