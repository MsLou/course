<template>
  <div class="home">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="发布文件">
        <el-radio v-model="form.file_type" label="1" :disabled="disabled">图片</el-radio>
        <el-radio v-model="form.file_type" label="2" :disabled="disabled">文件</el-radio>
        <el-upload
          v-show="form.file_type == 1"
          class="upload-demo"
          :before-upload="beforeUpload"
          :action="origin + 'admin/upload/'"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-success="onSuccess"
          :before-remove="beforeRemove"
          multiple
          :disabled="disabled"
          :limit="20"
          :on-exceed="handleExceed"
          list-type="picture"
          style="width: 350px;"
          :file-list="fileList">
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">支持扩展名：jpg , png, pdf</div>
        </el-upload>
        <div ref="editor" style="text-align:left" v-show="form.file_type == 2"></div>
        <div class="editor-disabled" v-if="disabled && form.file_type == 2"></div>
      </el-form-item>
      <el-form-item label="发布路径">
        <el-select v-model="form.path" placeholder="" :disabled="disabled">
          <el-option label="课题组概况" value="课题组概况"></el-option>
          <el-option label="新闻动态" value="新闻动态"></el-option>
          <el-option label="基金项目" value="基金项目"></el-option>
          <el-option label="学术成果" value="学术成果"></el-option>
          <el-option label="文娱体育" value="文娱体育"></el-option>
          <el-option label="资源共享" value="资源共享"></el-option>
          <el-option label="通知公告" value="通知公告"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发布标题">
        <el-input v-model="form.title" :disabled="disabled"></el-input>
      </el-form-item>
      <el-form-item label="发布人">
        <el-input v-model="form.create_name" :disabled="disabled"></el-input>
      </el-form-item>
      <el-form-item label="发布内容">
        <el-input type="textarea" v-model="form.content" rows="10" :disabled="disabled"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="goList">放弃</el-button>
        <el-button type="primary" @click="onSubmit" v-if="!disabled">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import E from 'wangeditor'

export default {
  name: 'home',
  data () {
    return {
      fileList: [],
      origin: origin,
      disabled: this.$route.query.view ? true : false,
      dataUrl: {
        edit_file: origin + 'edit_file'
      },
      editorContent: '',
      file_types: ['jpg', 'png', 'pdf'],
      form: {
        file_type: '1',
        file_url: '',
        title: '',
        filename: '',
        path: '',
        create_name: '',
        content: '',
        originName: '',
      }
    }
  },
  mounted () {
    if (this.$route.query.id) {
      this.getEditInfo(this.$route.query.id);
    }
    window.editor = new E(this.$refs.editor)
    editor.customConfig.onchange = (html) => {
      this.editorContent = html
    }
    editor.create()
  },
  methods: {
    // 返回列表
    goList () {
      this.$router.push('/')
    },
    // 获取信息
    getEditInfo (id) {
      $.ajax({
        url: this.dataUrl.edit_file,
        data: {
          id
        },
        type: 'GET',
        dataType: 'JSON',
        success: res => {
          if (res.errorCode === 1) {
            var data = res.data[0]
            this.form = data;
            if (data.file_type == 1) {
              var fileUrls = data.file_url.split(',')
              var originNames = data.origin_name.split(',')
              this.fileList = data.file_name.split(',').map((item, index) => {
                var host = location.origin.indexOf('127.0.0.1') > -1 ? '//127.0.0.1' : location.origin
                return {
                  name: item,
                  originName: originNames[index],
                  url: fileUrls[index]
                }
              })
              console.log(this.fileList)
            } else {
              editor.txt.html(res.data[0].file_name)
            }
          } else {
            this.$message.warning(res.errorMessage);
          }
        }
      })
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 文件上传前
    beforeUpload (file) {
      let status = false;
      // 类型校验
      this.file_types.every(item => {
        if (file.name.toLocaleLowerCase().indexOf(`.${item}`) > -1) {
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
    onSuccess(res, file, fileList) {
      fileList.forEach(item => {
        if (item.name === file.name) {
          item.url = /\.pdf$/.test(res.url) ? `${origin}uploads/timg.jpg` : `${origin}uploads/${res.url}`
          item.originName = res.name
        }
      })
      this.fileList = fileList
    },
    onSubmit() {
      // console.log(this.fileList);return;
      this.form.filename = this.fileList.map(item => item.name).join(',')
      this.form.file_url = this.fileList.map(item => item.url).join(',')
      this.form.originName = this.fileList.map(item => item.originName).join(',')
      var parmas = this.form
      switch(parmas.file_type) {
        case '1':
            // parmas
          break;
        case '2':
          parmas.htmlContent = this.editorContent
          break;
      }
      if (this.$route.query.id && this.$route.query.id.length > 0) {
        parmas.saveType = 'edit'
      } else {
        parmas.saveType = 'add'
      }
      $.ajax({
        url: origin + 'admin/save_file',
        type: 'POST',
        data: parmas,
        dataType: 'json',
        success: res => {
          // 提交成
          if (res.errorCode === 1) {
            this.$message({
              message: '恭喜你，操作成功',
              type: 'success'
            });
            this.$router.go(-1);
          } else {
            this.$message.error(res.errorMessage);
          }
        }
      })
    }
  }
}
</script>
<style>
.el-select-dropdown {
    z-index: 200005 !important;
  }
</style>
<style scoped>

  .home h2 {
    padding: 12px;
    font-size: 34px;
    font-weight: 100;
  }
  .editor-disabled {
    position: absolute;
    top: 92px;
    left: 0;
    width: 100%;
    height: 300px;
    background-color: #ddd;
    opacity: .7;
    z-index: 100000;
  }
</style>
