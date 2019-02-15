const app = getApp()
Page({
  data: {
    albumTypes: ['朋友', '个人', '家人', '宝宝', '同学', '同事', '情侣', '萌宠', '组织', '摄影', '粉丝', '其他'],
    albumTypeSelected:''
  },
  pickTab: function(e) {
    this.setData({albumTypeSelected : e.currentTarget.dataset.albumtype})
  },
  addAlbum: function(e) {
    const shared_album_type = this.data.albumTypeSelected
    if (!shared_album_type) {
      app.wxShowToast('alert', '请选择相册类型')
    } else {
      app.apiIndexPost('newAlbum', { shared_album_type }, function(res){
        wx.redirectTo({
          url:`/page/album/pages/album-detail/album-detail?shared_album_id=${res.shared_album_id}`
        })
      })
    }
  }
})
