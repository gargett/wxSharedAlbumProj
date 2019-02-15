
const app = getApp();
let confirmBoxText="", shared_album_id="";
Page({  
  /**
   * 页面的初始数据
   */
  data: {
    //是否管理员：1-是，0-否
    is_manager:0,
    char_lt:"<",
    hiddechangeTitile:true,
    hiddeconfirmBox:true,
    //相册封面上传路径
    changeCoverUrl:"",
    memberUrl:'',
    albumTitile:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    shared_album_id = options.shared_album_id;
    this.setData({ albumTitile: options.album_titile, is_manager: options.is_manager, changeCoverUrl: `/page/album/pages/change-cover/change-cover?shared_album_id=${shared_album_id}`, memberUrl:`/page/album/pages/member/member?shared_album_id=${shared_album_id}`})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  //修改相册名称
  changeTitile: function () {
    this.setData({
      hiddechangeTitile: !this.data.hiddechangeTitile
    })
  },
  titleInput:function(e) {
    this.setData({ albumTitile: e.detail.value})
  },
  cancelchangeTitile: function () {
    this.setData({ hiddechangeTitile: true })
  },
  confirmchangeTitile: function () {
    const shared_album_name = this.data.albumTitile,
          self = this
    this.cancelChangeTitle()
    app.apiIndexPost(
      'chengeAlbumName',
      { shared_album_name, shared_album_id },
      function () {
        wx.reLaunch({ url: `/page/album/pages/album-detail/album-detail?shared_album_id=${shared_album_id}`})
      }
    )
    
  },
  cancelChangeTitle:function() {
    this.setData({ hiddechangeTitile: true }, function () {
      console.log(self.data)
    })
  },
  //解散相册&&退出相册
  confirmBoxHidde: function (e) {
    var viewDataSet = e.target.dataset;
    confirmBoxText = viewDataSet.text;
    this.setData({
      hiddeconfirmBox: !this.data.hiddeconfirmBox,
      confirmBoxText: "是否" + confirmBoxText
    })
  },
  //取消按钮 解散相册&&退出相册
  confirmBoxCancel: function () {
    this.setData({ hiddeconfirmBox: true })
  },
  //确认按钮 解散相册&&退出相册
  confirmBoxConfirm: function () {
    console.log("confirmBoxText", confirmBoxText);
    if (confirmBoxText == "退出相册") {
      this.setData({ hiddeconfirmBox: true })
      app.apiIndexPost(
        'album_exit',
        { shared_album_id: shared_album_id },
        function (ret) {
          wx.reLaunch({ url: `/page/album/index` })
        }
      )
    }
    else if (confirmBoxText == "解散相册") {
      this.setData({ hiddeconfirmBox: true })
      app.apiIndexPost(
        'delAlbum',
        { shared_album_id: shared_album_id },
        function (ret) {
          wx.reLaunch({ url: `/page/album/index` })
        }
      )
    };
  },
})