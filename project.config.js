/**
 * 项目配置文件
 */


// var host = "192.168.100.11:8000"
var host = "bigdata.drpeng.com.cn"

var config = {

  // 下面的地址配合云端 Server 工作
  host,

  // 后台接口地址
  // apiUrl: `http://${host}/shared/index`,
  apiUrl: `https://${host}/shared/index`,
};

module.exports = config
