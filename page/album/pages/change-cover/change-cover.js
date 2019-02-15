const app = getApp()
let shared_album_id
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uploadBlockShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    shared_album_id = options.shared_album_id
    console.log(shared_album_id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  showUploadBlock: function() {
    console.log('?')
    this.setData({  uploadBlockShow: true  })
  },
  cancleupload:function() {
    this.setData({  uploadBlockShow: false  })
  },
  uploadimg:function(e) {
    const tp = e.currentTarget.dataset.uploadtype
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: [tp], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        const uploadTask = wx.uploadFile({
          url: app.globalData.apiUrl,
          filePath: tempFilePaths[0],
          name: 'image',
          formData: {
            oper: 'uploadCoverXcc',
            openid: app.globalData.openid,
            csrfmiddlewaretoken: 'wX3DQlLtXGqVobKvLRs2HD9ym5J4AaKJ',
            shared_album_id,
            index:0
          },
          header: {
            "Content-Type": "multipart/form-data"
          },
          success:function(res) {
            console.log(res)
            wx.navigateTo({ url: `/page/album/pages/album-detail/album-detail?shared_album_id=${shared_album_id}` })
          }
        })
      }
    })
    
  }
})