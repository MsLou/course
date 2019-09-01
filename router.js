const express = require('express');
const Global = require('./global/global')
const Fun_defult = require('./fun')
const connection = require('./sql');
const bodyParser = require('body-parser');

const router = express.Router();

router.use((req, res, next) => {
	next();
})

// post 中间件
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// 开始连接
connection.connect();

function formatDateNumber (str) {
	str = String(str)
	return str.length !== 1 ? str : '0' + str;
}

router.use((req, res, next) => {
	GLOBAL.headerBgSrc = (function () {
		return `${Fun_defult.random(11)}.jpg`
	})()
	var date = new Date()
	connection.query(`insert into ip_count values ('${req.ip.replace('::ffff:', '')}', '${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}', '${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}')`, (err, rows) => {
		if (err) return console.log(err);
	})
	next();
})

router.get('/', (req, res) => {
	// 数据响应
	const data = Global

	data.title = 'Luoxd的blog首页'
	connection.query("SELECT * FROM blog_page order by date DESC", (err, rows) => {
		if (err) return console.log(err);
		rows = rows.map((item) => {
			item.Date = Fun_defult.formatDate(item.Date);
			return item;
		})
		data.data = rows;
		res.render('list', data)
	})
})

router.get('/login', (req, res) => {
	// 数据响应
	const data = Global

	data.title = '登录到lxd123.com的后台'

	res.render('template/login', data)
})

router.get('/ipcount', (req, res) => {
	// 数据响应
	const data = Global

	data.title = 'ipcount'

	connection.query('SELECT * FROM ip_count', (err, rows) => {
		if (err) return console.log(err);
		rows = rows.map((item) => {
			const { date } = item;
			item.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
			return item;
		})
		res.render('admin/ipCount', {
			data: rows
		})
	})

	
})

router.get('/iconfont-demo', (req, res) => {
	// 数据响应
	const data = Global

	data.title = ''

	res.render('template/iconfont-demo', data)
})

router.get(/\d+\_\d+.html/, (req, res) => {
	// res.render('article' + (req.path.replace('.html', '')), {
	// 	title: '5465'
	// })
	// 数据响应
	const data = Global,
		fileName = req.path.replace('.html', '');

	connection.query(`SELECT * from blog_page where name='${fileName.replace('/', '')}'`, (err, rows) => {
		if (err) return console.log(err);
		const fileid = fileName.replace('/', '')
		new Promise((resolve, reject) => {
			connection.query(`SELECT * from blog_article_${fileid}`, (err, rows) => {
				rows = rows.map((item) => {
					const d = new Date(item.date)
					item.date = `${d.getFullYear()}-${formatDateNumber(d.getMonth() + 1)}-${formatDateNumber(d.getDate())} ${formatDateNumber(d.getHours())}:${formatDateNumber(d.getMinutes())}:${formatDateNumber(d.getSeconds())}`
					return item;
				})
				resolve(rows)
			})
		})
		.then((result) => {
			res.render('article', Object.assign(data, {
				title: rows[0].descrition,
				data: {
					articleName: rows[0].descrition
				},
				fileid: fileid,
				commendList: result,
				path: 'article' + fileName
			}))
		})
	})
})

router.post('/post-article', (req, res) => {
	const dateObj = new Date(),
		  dateStr = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate() + ' ' + formatDateNumber(dateObj.getHours()) + ':' + formatDateNumber(dateObj.getMinutes()) + ':' + formatDateNumber(dateObj.getSeconds())
	connection.query(`SELECT * from blog_page where name='${req.body.fileid}'`, (err, rows) => {
		if (err) return console.log(err);
		if (rows.length > 0) {
			connection.query(`UPDATE blog_page SET commendLength=${rows[0].commendLength + 1} WHERE name='${req.body.fileid}'`, (err, rows) => {})
		}
	})
	connection.query(`INSERT INTO blog_article_${req.body.fileid} VALUES ('${req.body.fileid}', '0', '${req.body.name}', '${req.body.content}', '${req.body.email}', '${dateStr}')`, (err, rows) => {
		if (err) return console.log(err);
		res.send({
			status: 1,
			msg: '发布成功'
		})
	})
})

// connection.end();

module.exports = router;