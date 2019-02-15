const openIdUrl = require('./config').openIdUrl
const apiUrl = require('./project.config').apiUrl
const pconfig = require('./project.config')
App({
  globalData: {
    hasLogin: false,
    // openid: 'o2rDl1VhJJ04K4Vf_DALzY0KipxY',
    openid: '',
    apiUrl: apiUrl,
    code:''
  },
  onLaunch: function () {
    console.log('App Launch')
    const self = this
    //登陆
    wx.login({
      success: function (data) {
        console.log(data)
        self.globalData.code = data.code
      },
      fail: function (err) {
        console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
      }
    })
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  setOpenid:function(opid) {
    this.globalData.openid = opid
  },
  wxapiIsAvailable: function(api) {
    if(api) {
      return true
    } else {
      return false
    }
  },
  wxShowModal: function (title, content, confirmCallback, cancelCallback) {
    wx.showModal({
      title: title,
      content: content,
      success: function (res) {
        if (res.confirm && confirmCallback) {
          confirmCallback()
        } else if (res.cancel && cancelCallback) {
          cancelCallback()
        }
      }
    })
  },
  wxShowToast: function(type, text){
    let imageUrl
    switch(type) {
      case 'success':
        imageUrl = 'success.png'
        break
      case 'fail':
        imageUrl = 'fail.png'
        break
      case 'alert':
        imageUrl = 'alert.png'
        break
    }
    console.log(imageUrl)
    wx.showToast({
      title:text,
      image: '/image/' + imageUrl,
      duration: 1500
    })
  },
  apiIndexPost: function (oper, data, successCallback, failCallback, completeCallback) {
    var self = this
    var dataSend = { oper: oper, openid: self.globalData.openid, csrfmiddlewaretoken: 'wX3DQlLtXGqVobKvLRs2HD9ym5J4AaKJ' }
    for (var x in data) {
      dataSend[x] = data[x]
    }
    wx.request({
      url: self.globalData.apiUrl,
      method: 'post',
      dataType: 'json',
      data: dataSend,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        res.data.msg == 1 ? successCallback(res.data) : self.wxShowToast('fail', '系统繁忙')
      },
      fail: function(e){
        console.log(e)
        self.wxShowToast('fail','请重新尝试')
        if (failCallback)
        failCallback()
      },
      complete: function() {
        if (completeCallback)
        completeCallback()
      }
    })
  },
  
})
