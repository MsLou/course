"use static"

const express = require('express');
// const Global = require('./global/global')
const Fun_defult = require('./../fun')
const connection = require('./../sql');
const bodyParser = require('body-parser');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
const nodeFs = require("node-fs")
const AdmZip = require('adm-zip')


const router = express.Router();

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
})

// post 中间件
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false, uploadDir: './uploads' }));

router.use('/uploads', express.static('uploads'))

// 文件上传配置
// router.use(express.bodyParser({  }))

// 开始连接
connection.connect();

router.get('/login', (req, res) => {
  res.render('login', {})
})

router.post('/login', (req, res) => {
  if (!req.body.user || !req.body.password) {
    return res.send('请填写用户名或者密码')
  }
  connection.query(`SELECT * FROM user where username='${req.body.user}' and userpass='${req.body.password}'`, (err, rows) => {
    if (err) return console.log(err);
    if (rows.length > 0) {
      connection.query('delete from user_login', (err, rows) => {
        const newToken = Fun_defult.randomToken(18)
        connection.query(`insert into user_login values ('123456', '${newToken}', '2017-12-15', '${req.body.user}')`, (err, rows) => {
          if (err) return console.log(err);
          res.cookie('token', newToken, { expires: new Date(Date.now() + 1440000), httpOnly: true });
          res.send({
            errorCode: 0,
            errorMessage: ''
          })
        })  
      })
    } else {
      res.cookie('token', { expires: new Date(Date.now() + 0), httpOnly: true });
      res.send({
        errorCode: 1,
        errorMessage: '用户名不存在或者密码错误'
      })
    }
  })
})

router.get('/admin/files', (req, res) => {
  connection.query(`SELECT * from file_list order by date desc`, (err, rows) => {
    if (err) return console.log(err);
    res.send({
      data: rows,
      errorCode: 1,
      errorMessage: ''
    });
  })
})

/**
 * 上传文件
 * @param  {[type]} '/admin/upload' [description]
 */
router.post('/admin/upload', upload.any(), (req, res) => {
  const fileType = ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'],
    fileTypeString = ['jpg', 'jpg', 'png', 'pdf']
  const { filename, mimetype} = req.files[0]
  let newName = `${filename}.${fileTypeString[fileType.indexOf(mimetype)]}`

  fs.rename(`uploads/${filename}`, `uploads/${newName}`, err => {
    if (err) return console.log(err);
    res.send({
      url: newName,
      name: `${filename}.${fileTypeString[fileType.indexOf(mimetype)]}`,
      sort: req.body ? req.body.sort : null,
      errorCode: 1,
      errorMessage: ''
    })
  })
  
})

router.get('/edit_file', (req, res) => {
  if (!req.query.id) {
    return res.send({
      data: [],
      errorCode: -1,
      errorMessage: 'ID不能为空'
    })
  }
  connection.query(`SELECT * from file_list where id='${req.query.id}'`, (err, rows) => {
    if (err) return console.log(err);
    res.send({
      data: rows,
      errorCode: 1,
      errorMessage: ''
    })
  })
  
})

router.post('/admin/save_file', (req, res) => {
  const field = ['title', 'content', 'path', 'create_name'],
  fieldText = ['标题', '内容', '路径', '发布人'];
  let errorMessage = '';
  field.every((item, index) => {
    if (!req.body[item]) {
      errorMessage = `${fieldText[index]}不能为空`;
      return false;
    }
    return true;
  })
  // 如果有错误
  if (errorMessage) {
    return res.send({
      data: [],
      errorCode: -1,
      errorMessage: errorMessage
    })
  }
  if (req.body.file_type) {
    if (req.body.fileType == 1 && !req.body.filename) {
      return res.send({
        data: null,
        errorCode: -1,
        errorMessage: '发布文件不能为空'
      })
    }
  } else{
    return res.send({
      data: null,
      errorCode: -1,
      errorMessage: '未知错误'
    })
  }
  let {title, path, create_name, content, filename, htmlContent, originName, file_url} = req.body

  let randomToken = Fun_defult.randomToken(6)
  let sqlString = '';
  switch (req.body.saveType) {
    case 'edit':
      sqlString = `UPDATE file_list SET title='${title}',create_name='${create_name}',content='${content}',file_name='${filename || htmlContent}',origin_name='${originName}',path='${path}',file_url='${file_url}' where id='${req.body.id}'`
      break;
    case 'add':
      sqlString = `INSERT INTO file_list values ('${randomToken}','${title}','${content}','${path}','${create_name}', '${new Date().getTime()}', '${filename || htmlContent}', '${req.body.file_type}', '${originName}', '${file_url}')`;
      break;
  }
  connection.query(sqlString, (err, rows) => {
    if (err) return console.log(err);
    res.send({
      data: null,
      errorCode: 1,
      errorMessage: 'OK'
    });
  })
})

router.get('/', (req, res) => {
  res.render('index')
})

router.get('/admin', (req, res) => {
  res.render('admin')
})

router.get('/course', (req, res) => {
  res.render('course')
})
router.get('/new', (req, res) => {
  res.render('new')
})
router.get('/achievements', (req, res) => {
  res.render('achievements')
})
router.get('/project', (req, res) => {
  res.render('project')
})
router.get('/sports', (req, res) => {
  res.render('sports')
})
router.get('/resources', (req, res) => {
  res.render('resources')
})

/**
 * 查询指定路径的数据
 * @param req.query.type { 0 = 课题组概况 1 = 新闻动态, 2 = 学术成果, 3 = 基金项目, 4 = 文娱体育, 5 = 资源共享 }
 * @author luoxd
 */
router.all('/getData', (req, res) => {
  if (!req.query.type) {
    res.send({
      data: null,
      errorCode: -1,
      errorMessage: '参数错误'
    })
  }
  const types = ['课题组概况', '新闻动态', '学术成果', '基金项目', '文娱体育', '资源共享', '通知公告'];
  const reqData = req.query.data
  let selectSql = '',
    type = Number(req.query.type);
  let start = req.query.page * req.query.size - req.query.size,
    end = req.query.page * req.query.size;
  function getDMY (date) {var d = new Date(date);return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`}
  // ' LIMIT ${start},${end}'
  selectSql = `SELECT * FROM file_list where path='${types[type]}'`
  for(let item in reqData) {
    if (!reqData[item]) continue;
    switch(item) {
      case 'date':
        let date = Date.parse(reqData.date)
        selectSql += ` and date>'${Date.parse(getDMY(date))}' and date<'${Date.parse(getDMY(date+86400000))}' `
        break;
      default:
      selectSql += ` and ${item} LIKE '%${reqData[item]}%'`
    }
  }
  selectSql += ' order by date desc'
  console.log(selectSql)
  connection.query(selectSql, (err, rows) => {
    if (err) return console.log(err);
    res.send({
      data: rows.filter((item, index) => {
        if (index >= start && index < end) {
          return item;
        }
        return false;
      }),
      total: rows.length,
      errorCode: 1,
      errorMessage: 'ok'
    })
  })
})

/**
 * 获取文件信息
 */
router.all('/getFileInfo', (req, res) => {
  if (!req.query.id) {
    res.send({
      data: null,
      errorMessage: '参数不能为空',
      errorCode: -1
    })
    return;
  }
  connection.query(`SELECT * FROM file_list where id='${req.query.id}'`, (err, rows) => {
    if (err) return console.log(err);
    // console.log(router.path())
    let { origin_name, file_type, file_name } = rows[0];

    if(/\.jpg$|\.png$/.test(origin_name)) {
      res.send({
        data: {
          type: file_type,
          name: origin_name
        },
        errorMessage: '',
        errorCode: 1
      })
    } else {
      res.send({
        data: origin_name || file_name,
        errorMessage: '',
        errorCode: 1
      })
    }
    
  })
})

/**
 * 删除文件
 */
router.get('/deleteFile', (req, res) => {
  connection.query(`delete from file_list where id="${req.query.id}"`, (err, rows) => {
    if (err) return console.log(err);
    res.send({
      data: null,
      errorMessage: '',
      errorCode: 1
    })
  })
})

/**
 * 轮播图
 */
router.get('/saveBanner', (req, res) => {
  let deleteSql = 'delete from banner where ';
  req.query.data.forEach((item, index) => {
    deleteSql += `sort="${item.sort}"`
    if (index !== req.query.data.length - 1) {
      deleteSql += ' or '
    }
  })
  connection.query(deleteSql, (err) => {
    if (err) return console.log(err);
    let sqlString = 'INSERT INTO banner VALUES';
    req.query.data.forEach((item, index) => {
      sqlString += `('${item.filename}',${item.sort}, '${item.text}')`
      if (index !== req.query.data.length - 1) {
        sqlString += ',';
      }
    })
    connection.query(sqlString, (err) => {
      if (err) return console.log(err);
      res.send({
        data: null,
        errorMessage: '',
        errorCode: 1
      })
    })
  })
})

/**
 * 获取轮播图
 */
router.get('/getBanner', (req, res) => {
  connection.query(`SELECT * FROM banner order by sort`, (err, rows) => {
    if (err) return console.log(err);
    res.send({
      data: rows,
      errorMessage: '',
      errorCode: 1
    })
  })
})

/**
 * 获取最近更新
 */
router.get('/getRecentlyFile', (req, res) => {
  connection.query('SELECT * FROM file_list order by date desc', (err, rows) => {
    if (err) return console.log(err);
    res.send({
      data: rows.filter((item, index) => {
        if (index < 3) {
          return item;
        }
        return;
      }),
      errorMessage: '',
      errorCode: 1
    })
  })
})

module.exports = router;