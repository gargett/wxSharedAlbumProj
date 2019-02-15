const app = getApp()
let shared_album_id, piclibpaths = [], piclibids = [], count = 0, uploadTasks = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picList:[],
    text:'',
    showProg:false,
    uploadProgress:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    shared_album_id = options.shared_album_id
    console.log(shared_album_id)
    let localpath = []
    if (options.localpath) {
      localpath = options.localpath.split(',')
    } else if (options.pathobj) {
      const picsFromPiclib = JSON.parse(options.pathobj)
      picsFromPiclib.forEach(function(item){
        localpath.push(item.locate_path)
        piclibpaths.push(item.locate_path)
        piclibids.push(item.picture_id)
      })
    }
    console.log(localpath)
    this.setData({ picList: localpath},function(){
      
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  delete_pic: function(e) {
    const index = e.currentTarget.dataset.idx
    let picList = this.data.picList
    picList.splice(index, 1)
    this.setData({ picList: picList })
  },
  upload:function(e) {
    const self = this
    let libpics = [], localpics = []
    this.data.picList.forEach(function(item){

      if (piclibpaths.indexOf(item) >= 0) {
        libpics.push(piclibids[ piclibpaths.indexOf(item) ])
      } else {
        localpics.push(item)
      }
    })

    if (localpics.length == 0) {
      const batch_text = this.data.text
      app.apiIndexPost('uploadByPicList', 
        { 
          picid_list_str: libpics.join('-'), 
          shared_album_id, 
          position: '',
          batch_id: '', 
          release_time: '', 
          batch_text 
        }, 
        function (res) {
          wx.navigateTo({ url: `/page/album/pages/album-detail/album-detail?shared_album_id=${shared_album_id}`})
        }
      )
    } else {
      self.uploadFile(libpics, localpics)
    }
  },
  addPic:function(e) {
    const countLeft = 9 - this.data.picList.length,
          self = this
    wx.chooseImage({
      count: countLeft, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        self.setData({picList: tempFilePaths.concat(self.data.picList)})
      }
    })
  },
  changeText:function(e) {
    const self = this
    this.setData({ text: e.detail.value }, function(){
      console.log(self.data)
    })
  },
  uploadFile: function (libpics, localpics) {
    const self = this
    let batch_id = 0
    uploadTasks = []
    
    self.setData({ showProg: true, uploadProgress: 0 })
    // 先上传一张local的拿回batchid
    uploadTasks[0] = wx.uploadFile({
      url: app.globalData.apiUrl,
      filePath: localpics[0],
      name: 'image',
      formData: {
        oper: 'uploadXcc',
        openid: app.globalData.openid,
        csrfmiddlewaretoken: 'wX3DQlLtXGqVobKvLRs2HD9ym5J4AaKJ',
        shared_album_id,
        index: 0,
        batch_text: self.data.text
      },
      header: {
        "Content-Type": "multipart/form-data"
      },
      success: function (ret) {
              const result = JSON.parse(ret.data)
              batch_id = result.batch_id
              console.log('?')
              console.log(result)
              //再上传全部
              if (batch_id != 0) {
                for (let i = 1, len = localpics.length; i < len; i++) {
                  uploadTasks[i] = wx.uploadFile({
                    url: app.globalData.apiUrl,
                    filePath: localpics[i],
                    name: 'image',
                    formData: {
                      oper: 'uploadXcc',
                      openid: app.globalData.openid,
                      csrfmiddlewaretoken: 'wX3DQlLtXGqVobKvLRs2HD9ym5J4AaKJ',
                      shared_album_id: shared_album_id,
                      index: i,
                      batch_id: batch_id
                    },
                    header: {
                      "Content-Type": "multipart/form-data"
                    },
                    success: function (res) {
                      console.log('test', res)
                    }
                  })
                  uploadTasks[i].onProgressUpdate(function(res) {
                    console.log('上传进度', res.progress)
                    console.log('已经上传的数据长度', res.totalBytesSent)
                    console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
                    if (res.progress == 100) {
                      count++
                      self.setData({ uploadProgress: (count / (len - 1)).toFixed(2) * 100 })
                      if (count == len - 1) {
                        self.setData({ showProg: false })
                        if (libpics.length > 0 && batch_id != 0) {
                          app.apiIndexPost('uploadByPicList',
                            {
                              picid_list_str: libpics.join('-'),
                              shared_album_id,
                              position: '',
                              batch_id: batch_id,
                              release_time: ''
                            },
                            function (res) {
                              setTimeout(function () {
                                wx.navigateTo({ url: `/page/album/pages/album-detail/album-detail?shared_album_id=${shared_album_id}` })
                              }, 1000)

                            }
                          )
                        } else {
                          setTimeout(function () {
                            wx.navigateTo({ url: `/page/album/pages/album-detail/album-detail?shared_album_id=${shared_album_id}` })
                          }, 1000)
                        }
                      }
                    }
                  })
                }
              }
              
      }
    })

    
    
  }
})