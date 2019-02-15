const app = getApp()
let topage = '/page/album/index',
    authorizeFail = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAuth: true,
    isLoading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this
    if (options.topage == 'detail') {
      const shared_album_id = options.shared_album_id,
            invite = options.invite
      topage = `/page/album/pages/album-detail/album-detail?shared_album_id=${shared_album_id}&invite=${invite}`
    } else if (options.topage == 'batchpreview') {
      const batch_id = options.batch_id
      topage = `/page/album/pages/batch-preview/batch-preview?batch_id=${batch_id}`
    }
    self.authorizeSetting()
    
  },
  onShow: function (e) {
    console.log('authorize onShow')
    const self = this
    if (authorizeFail) {
      self.authorizeSetting()
    }
  },
  bindGetUserInfo: function (e) {
    console.log(e.detail)
    const self = this
    app.apiIndexPost('get_openidXcc', { xcccode: app.globalData.code, encryptedData: e.detail.encryptedData, iv: e.detail.iv },
      function (ret) {
        app.setOpenid(ret.open_id)
        self.setData({ isLoading: false })
        wx.reLaunch({ url: topage })
      })
  },
  authorizeSetting:function(){
    const self = this
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          console.log('已授权')
          // 已经授过权，直接调用getUserInfo
          self.setData({ isAuth: true, isLoading: true }, function () {
            wx.getUserInfo({
              success: function (res) {
                console.log(res)
                if (!app.globalData.openid) {
                  wx.request({
                    url: app.globalData.apiUrl,
                    method: 'post',
                    dataType: 'json',
                    data: { oper: 'get_openidXcc', csrfmiddlewaretoken: 'wX3DQlLtXGqVobKvLRs2HD9ym5J4AaKJ', xcccode: app.globalData.code, encryptedData: res.encryptedData, iv: res.iv },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                      if (res.data.msg == 1) {
                        console.log('???')
                        app.setOpenid(res.data.open_id)
                        self.setData({ isLoading: false })
                        wx.reLaunch({ url: topage })
                      } else {
                        app.wxShowToast('fail', '系统繁忙')
                        authorizeFail = true
                      }
                    },
                    fail: function (e) {
                      console.log(e)
                      app.wxShowToast('fail', '请重新尝试')
                      authorizeFail = true
                    }
                  })

                  // app.apiIndexPost('get_openidXcc', { xcccode: app.globalData.code, encryptedData: res.encryptedData, iv: res.iv },
                  //   function (ret) {
                  //     app.setOpenid(ret.open_id)
                  //     self.setData({ isLoading: false })
                  //     wx.reLaunch({ url: topage })
                  //   }, function(){
                  //     authorizeFail = true
                  //   })
                } else {
                  wx.reLaunch({ url: topage })
                }

              }
            })
          })
        } else {
          //没授过权，显示button引导授权
          console.log('没授权')
          self.setData({ isAuth: false, isLoading: false })
        }
      }
    })
  }
})