const app = getApp()
Page({
  data: {
    albumList: [],
    background: ['http://bigdata.drpeng.com.cn/shared_static/images/banner4.png']
  },
  onLoad: function (options) {
    console.log('onload')
    // wx.navigateTo({ url: '/page/test/test1' })
    // wx.navigateTo({ url: '/page/album/pages/member/member?shared_album_id=188&is_manager=0' })
    // wx.navigateTo({ url: '/page/album/pages/album-setting/album-setting?album_titile=啦啦啦&shared_album_id=123&is_manager=0' })
    // wx.navigateTo({ url: '/page/album/pages/batch-preview/batch-preview?batch_id=666' })
    // wx.navigateTo({ url: '/page/piclib/piclib' })
    // wx.navigateTo({ url: '/page/album/pages/batch-preview/batch-preview' })
    // wx.navigateTo({ url: 'page/album/pages/search-album/search-album' })
    // wx.navigateTo({ url: '/page/album/pages/change-cover/change-cover?shared_album_id=123' })
    // wx.navigateTo({ url:'/page/album/pages/album-detail/album-detail?shared_album_id=326&invite=1'})
    // wx.navigateTo({ url: '/page/album/pages/upload-batch/upload-batch?localpath=http://tmp/touristappid.o6zAJs3x8ee6sYsgYDKdUGgqq_tM.965eea2f118e36d232d79634566b1c1f.png,http://bigdata.drpeng.com.cn/album_static/userImgs/g708/g708_i0.jpg' })

    const self = this
    if(!app.globalData.openid) {
      wx.reLaunch({
        url: '/page/authorize',
      })
    }
  },
  onReady: function (e) {
    const self = this
    if (!app.globalData.openid) {
      wx.reLaunch({
        url: '/page/authorize',
      })
    } else {
      app.apiIndexPost('album_list', {}, function (res) {
        self.setData({ albumList: res.shared_album_list })
      })
    }
  },
  onShow: function (e) {
    console.log('onShow')
    if (!app.globalData.openid) {
      wx.reLaunch({
        url: '/page/authorize',
      })
    }
  },
  onHide: function (e) {
    console.log('onHide')
  },
  onPullDownRefresh: function () {
    const self = this
    app.apiIndexPost('album_list', {}, function (res) {
      self.setData({ albumList: res.shared_album_list }, function(){
        wx.stopPullDownRefresh()
      })
    })
  },
  toggleSetTop: function(e) {
    const shared_album_id = e.currentTarget.dataset.shared_album_id,
          if_top = e.currentTarget.dataset.if_top,
          self = this
    let alertText
    if (if_top == 0)
      alertText = '是否置顶该相册'
    else
      alertText = '是否取消置顶该相册'
    app.wxShowModal('提示',alertText, function(){
      app.apiIndexPost('toggleTopAlbum', { shared_album_id:shared_album_id }, function(){
        self.refresh()
      })
    })
  },
  refresh: function(){
    const self = this
    wx.startPullDownRefresh({ 
      success:function(){
        app.apiIndexPost('album_list', {}, function (res) {
          self.setData({ albumList: res.shared_album_list })
          wx.stopPullDownRefresh()
        })
      }
    })
  },
  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
  }
})
