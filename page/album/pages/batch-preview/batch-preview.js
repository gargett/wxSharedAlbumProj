const app = getApp()
let batch_id
Page({

  /**
   * 页面的初始数据
   */
  data: {
    album_batch_viewst:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    batch_id = options.batch_id
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const self = this
    app.apiIndexPost(
      'batchPrevewPost',
      { batch_id },
      function (res) {
        res.album_batch_list.forEach(function (item) {
          //添加批次自己是否点赞过
          let isLiked = false
          item.like_list.forEach(function (item2) {
            if (app.globalData.openid == item2.openid)
              isLiked = true
          })
          item.isLiked = isLiked

          //确保只有9张图
          item.pic_list = item.pic_list.slice(0, 9)
        })
        res.album_batch_list = res.album_batch_list.slice(0,1)
        self.setData({
          album_batch_viewst: res.album_batch_list
        })

      }
    )
  },
  seemore:function() {
    wx.switchTab({
      url: '/page/album/index'
    })
  },
  addmyalbum:function() {
    wx.navigateTo({
      url:'/page/album/pages/add-album/add-album'
    })
  }
})