const express = require('express')
const ejs = require('ejs');

const app = express()

const adminController = require('./controller/admin')

// 静态文件托管
app.use(express.static('temp'))


// 路由
app.use('/', adminController);

// app.engine('.html', ejs.__express)
app.set('view engine', 'ejs')
app.set('views', __dirname + '/temp')
app.listen(80)
