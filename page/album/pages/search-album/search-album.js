const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    focus:true,
    searchKey:"",
    searchList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  bindKeyInput: function(e) {
    const self = this
    this.setData({searchKey:e.detail.value})
  },
  bindconfirm:function() {
    this.toSearch()
  },
  toSearch:function() {
    const self = this
    app.apiIndexPost('search', { key_word: self.data.searchKey }, function(res) {
      self.setData({ searchList: res.shared_album_list})
    })
  }
})