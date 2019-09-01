<template>
  <div id="app">
    <div class="head"></div>
    <div class="content">
      <div class="menu">
        <ul>
          <li>
            <router-link to="/">
              文件上传
              <i class="el-icon-arrow-right"></i>
            </router-link>
          </li>
          <li>
            <router-link to="/picUpload/edit">
              图片上传
              <i class="el-icon-arrow-right"></i>
            </router-link>
          </li>
        </ul>
      </div>
      <div class="view">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style>
  * {padding: 0;margin: 0;}
  a {text-decoration: none;}
  body { color: #333; }
  html,body,#app { height: 100%; }
  .content {
    position: relative;height: 100%;
  }
  .content .menu {
    width: 300px;position: fixed;
    top: 75px;
    left: 0;height: 100%;background-color: rgb(70,77,85);
  }
  .menu {
    
  }
  .menu li a { color: #fff;display: block;padding: 12px;transition: .25s;position: relative; }
  .menu li a:hover { background-color: #666; }
  .menu li a i { position: absolute; right: 10px;top: 14px; }
  .content .view {
    margin-left: 300px;padding-top: 75px;overflow: hidden;
  }
  .head {
    background-color: rgb(68,66,69);
    height: 75px;position: fixed;width:100%;z-index: 220000;
  }
</style>
