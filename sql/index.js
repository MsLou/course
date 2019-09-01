const mysql = require('mysql');

// 创建连接
var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '123456',
	database: 'test'
})

module.exports = connection;