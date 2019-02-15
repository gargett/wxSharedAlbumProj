const app = getApp()
let selectCount = 0, piclibIndex = 0, shared_album_id
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picList:[],
    isLoading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    shared_album_id = options.shared_album_id
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const self = this
    this.postAndSetPiclibList()
    // app.apiIndexPost('photo_gallery', { index: 0 }, function (ret) {
    //   ret.photo_list.forEach(function (item) {
    //     item.isSelected = false
    //     item.locate_path = `http://bigdata.drpeng.com.cn/album_static/${item.locate_path}`
    //   })
    //   self.setData({ picList: ret.photo_list})
    // })
  },
  onReachBottom: function () {
    console.log('?')
    const self = this
    this.setData({  isLoading: true  }, function () {
      piclibIndex++
      self.postAndSetPiclibList(function (res) {
        if (res.photo_list == 0) {
          piclibIndex = 10000
        }
        self.setData({ isLoading: false  })
      })
    })
  },
  selectPic:function(e) {
    const idx = e.currentTarget.dataset.idx
    let picList = this.data.picList
    if (!picList[idx].isSelected && selectCount == 9) {
      app.wxShowToast('alert','最多选择9张')
      return
    }
    picList[idx].isSelected ? selectCount-- : selectCount++
    picList[idx].isSelected = !picList[idx].isSelected
    this.setData({ picList})
  },
  upload:function(e) {
    let pics = []
    this.data.picList.forEach(function(item) {
      if(item.isSelected) {
        pics.push({ picture_id: item.picture_id, locate_path: item.locate_path})
      }
    })
    wx.navigateTo({ url: `/page/album/pages/upload-batch/upload-batch?shared_album_id=${shared_album_id}&pathobj=${JSON.stringify(pics) }` })
  },
  postAndSetPiclibList: function (callback) {
    const self = this
    app.apiIndexPost('photo_gallery', { index: piclibIndex }, function (ret) {
      ret.photo_list.forEach(function (item) {
        item.isSelected = false
        item.locate_path = `http://bigdata.drpeng.com.cn/album_static/${item.locate_path}`
      })
      let picList = self.data.picList
      picList = picList.concat(ret.photo_list)
      self.setData({ picList }, function () {
        if (callback)
          callback(ret)
      })
    })
  },
})