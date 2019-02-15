const app = getApp()
let shared_album_id, batchIdToOper, commentIdToOper, comment_reply_to, reply_nickname, longpresslock = false, batch_index = 0, my_nick = '', joinState = false, invite
Page({
  data: {
    albumDetail:{
      shared_album_cover: '',
      shared_album_is_owner: 0,
      shared_album_title: '',
      album_pic_count: 0,
      album_user_count: 0,
      admin_nick_name: ''
    },
    
    album_batch_list:[],
    likeAnimation:{},
    comment_text : '',
    placeholderText:'写评论...',
    changeTitleText:'',
    state:{
      moreFunShow:false,
      commentBlockShow:false,
      uploadBlockShow:false,
      commentFocus:false,
      titleBlockShow:false,
      batchIsLoading:false,
      batchSelectedIfTop:'0'
    }
  },
  onLoad: function (options) {
    console.log('onLoad')
    shared_album_id = options.shared_album_id
    invite = options.invite
    
    
  },
  onReady: function () {
    console.log('ready')
    const self = this
    batch_index = 0

    if (invite) {
      //判断是否加入了相册
      app.apiIndexPost('joinXcc', { shared_album_id }, function (res) {
        console.log(res)
        if (res.msg) {
          if (res.join == 1) {
            app.wxShowToast('success', '加入成功')
          }
          self.showAlbumDetail()
        } else {
          app.wxShowToast('fail', '失败')
        }
      })
    } else {
      self.showAlbumDetail()
    }
    

    //获得confirm-box组件
    // this.confirmBox = this.selectComponent("#confirmBox");
  },
  onPullDownRefresh: function () {
    const self = this
    batch_index = 0
    self.postAndSetBatchList(function () {
      wx.stopPullDownRefresh()
    },true)
    
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom')
    const self = this
    this.setData({ state: { ...this.data.state, batchIsLoading:true}}, function(){
      batch_index++
      self.postAndSetBatchList(function(res){
        if (res.album_batch_list == 0) {
          batch_index = 10000
        }
        self.setData({ state: { ...self.data.state, batchIsLoading: false } })
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let path = '', imageUrl = '', title = ''
    if (res.from === 'button') {
      // 来自页面内转发按钮
      const dataset = res.target.dataset
      if (dataset.zhuanfatype == 'album') {
        console.log('invite')
        path = `/page/authorize?topage=detail&shared_album_id=${shared_album_id}&invite=1`
        title = '加入我的相册吧！'
      } else {
        console.log('share')
        path = `/page/authorize?topage=batchpreview&batch_id=${dataset.batch_id}`
        imageUrl = `http://bigdata.drpeng.com.cn/album_static/${dataset.batch_share_cover}`
        title = dataset.batch_share_desc
        console.log(title)
      }
    }
    return {
      title: title,
      path: path,
      imageUrl: imageUrl
    }
  },
  showMoreFunc: function(e) {
    batchIdToOper = Number(e.currentTarget.dataset.batch_id)
    const batchSelectedIfTop = e.currentTarget.dataset.if_top
    const batchOwnerType = e.currentTarget.dataset.ownertype
    const sharedAlbumIsOwner = this.data.albumDetail.shared_album_is_owner
    console.log(sharedAlbumIsOwner)
    this.setData({ state: { ...this.data.state, ...{ moreFunShow: true, batchSelectedIfTop, batchOwnerType, sharedAlbumIsOwner  } }})
  },
  cancelMoreFun: function() {
    this.setData({ state: { ...this.data.state, ...{moreFunShow: false} } })
  },
  settopBatch: function() {
    const self = this
    self.cancelMoreFun()
    app.apiIndexPost('toggleTopBatch', { batch_id: batchIdToOper }, function(){
      
        self.refresh()

    })
  },
  deleteBatch:function() {
    const self = this
    self.cancelMoreFun()
    app.wxShowModal('提示', '是否删除故事', function () {
      self.confirmDeleteBatch()
    })
  },
  confirmDeleteBatch : function(){
    let batchList = this.data.album_batch_list
    for (let i = 0, len = batchList.length; i < len; i++) {
      if (batchList[i].batch_id == batchIdToOper) {
        batchList.splice(i, 1)
        break
      }
    }
    this.setData({ album_batch_list: batchList})
    app.apiIndexPost('delBatch', { batch_id: batchIdToOper }, function () {
      app.wxShowToast('success','成功')
    })
  },
  withdrawComment:function(e) {
    console.log('with')
    const self = this
    longpresslock = true
    commentIdToOper = e.currentTarget.dataset.commentid
    app.wxShowModal('提示', '是否删除评论', function () {
      self.confirmWithdrawComment()
    })
  },
  confirmWithdrawComment: function(e) {
    console.log(commentIdToOper)
    let batchList = this.data.album_batch_list
    batchList.forEach(function (item) {
      item.com_list.forEach(function(item2, index2){
        if (item2.comment_id == commentIdToOper) {
          item.com_list.splice(index2,1)
        }
      })
    })
    this.setData({ album_batch_list: batchList })
    app.apiIndexPost('del_comment', { comment_id: commentIdToOper }, function (res) {
      app.wxShowToast('success', '成功')
    })
  },
  showCommentBlock:function(e) {
    if (longpresslock) {
      longpresslock = false
    } else {
      
      batchIdToOper = e.currentTarget.dataset.batch_id
      comment_reply_to = e.currentTarget.dataset.comment_openid ? e.currentTarget.dataset.comment_openid : ''
      reply_nickname = e.currentTarget.dataset.comment_nick
      const placeholderText = e.currentTarget.dataset.comment_nick ? `@${e.currentTarget.dataset.comment_nick}` : `写评论...`
      this.setData({ state: { ...this.data.state, ...{ commentBlockShow: true, commentFocus: true } }, placeholderText })
    }
  },
  hideCommentBlock:function(e) {
    this.setData({ state: { ...this.data.state, ...{ commentBlockShow: false, commentFocus: false } }, comment_text:'' })
  },
  setCommentText:function(e) {
    this.setData({ comment_text: e.detail.value })
  },
  sendComment: function() {
    const comment_text = this.data.comment_text
    if (comment_text.length != 0) {
      this.hideCommentBlock()
      let batchList = this.data.album_batch_list
      batchList.forEach(function (item) {
        if (item.batch_id == batchIdToOper) {
          item.com_list.push({ comment_id: 0, comment_content: comment_text, comment_is_owner: 1, comment_nick: my_nick, reply_nickname: reply_nickname })
        }
      })
      this.setData({ album_batch_list: batchList })
      app.apiIndexPost('album_batch_comment', { comment_text, comment_reply_to, 'batch_id': batchIdToOper }, function (res) {
        app.wxShowToast('success', '成功')
      })
    }
  },
  toggleLike(e) {
    const batch_id = e.currentTarget.dataset.batch_id,
          self = this
    let batchList = this.data.album_batch_list
    batchList.forEach(function (item) {
      if (item.batch_id == batch_id) {
        if (item.isLiked) {
          item.like_count -= 1
        } else {
          self.likeAnimation()
          item.like_count += 1
        }
        item.isLiked = !item.isLiked
      }
    })
    this.setData({ album_batch_list: batchList })
    app.apiIndexPost('album_batch_like', { batch_id }, function () {
    })
  },
  showUploadBlock:function(e) {
    this.setData({ state: { ...this.data.state, uploadBlockShow:true } })
  },
  hideUploadBlock:function(e) {
    this.setData({ state: { ...this.data.state, uploadBlockShow: false } })
  },
  selectUploadType:function(e) {
    const uploadType = e.currentTarget.dataset.uploadtype
    if (uploadType == 'piclib') {
      wx.navigateTo({ url: `/page/album/pages/uploadbatch-select-piclib/uploadbatch-select-piclib?shared_album_id=${shared_album_id}` })
    } else {
      this.wxChooseImg(uploadType)
    }
  },
  showTitleBlock: function() {
    if (this.data.albumDetail.shared_album_is_owner  == 1) {
      this.setData({ state: { ...this.data.state, titleBlockShow: true } })
    } else {
      app.wxShowToast('alert','您不是管理员')
    }
    
  },
  titleInput: function(e) {
    console.log(e.detail.value)
    this.setData({ changeTitleText: e.detail.value})
  },
  confirmChangeTitle:function(e) {
    const shared_album_name = this.data.changeTitleText,
          self = this
    this.cancelChangeTitle()
    app.apiIndexPost(
      'chengeAlbumName',
      { shared_album_name, shared_album_id },
      function () {
        app.apiIndexPost('getAlbumDetail', { shared_album_id }, function (res) {
          self.setData({ albumDetail: res })
        })
      }
    )
  },
  toChangeCover:function() {
    wx.navigateTo({ url: `/page/album/pages/change-cover/change-cover?shared_album_id=${shared_album_id}` })
  },
  toEditAlbum: function() {
    wx.navigateTo({ url: `/page/album/pages/album-setting/album-setting?album_titile=${this.data.albumDetail.shared_album_title}&shared_album_id=${shared_album_id}&is_manager=${this.data.albumDetail.shared_album_is_owner}` })
  },
  cancelChangeTitle:function() {
    this.setData({ state: { ...this.data.state, titleBlockShow: false } })
  },
  imgPreview:function(e) {
    const locate_path = e.currentTarget.dataset.locate_path
    let pics_to_show = []

    const shared_album_cover = this.data.albumDetail.shared_album_cover
    pics_to_show.push(`http://bigdata.drpeng.com.cn/album_static/${shared_album_cover}`)
    this.data.album_batch_list.forEach(function(item){
      item.pic_list.forEach(function(item2){
        pics_to_show.push(`http://bigdata.drpeng.com.cn/album_static/${item2.locate_path}`)
      })
    })
    console.log(`http://bigdata.drpeng.com.cn/album_static/${locate_path}`)
    console.log(pics_to_show)
    wx.previewImage({
      current: `http://bigdata.drpeng.com.cn/album_static/${locate_path}`, // 当前显示图片的http链接
      urls: pics_to_show // 需要预览的图片http链接列表
    })
  },
  dealWithPicsWidth: function(len, item) {
    if (len == 1) {
      item.pic_list.forEach(function(item2){
        item2.pic_wid = 670
        item2.pic_height = 339
      })
    } else if (len == 2 || len == 4) {
      item.pic_list.forEach(function (item2) {
        item2.pic_wid = item2.pic_height = 326
      })
    } else if (len > 0) {
      item.pic_list.forEach(function (item2) {
        item2.pic_wid = item2.pic_height = 215
      })
    }
  },
  likeAnimation: function() {
    let animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
    })
    this.animation = animation

    animation.scale(1.2, 1.2).step()
    animation.scale(1, 1).step()
    this.setData({
      likeAnimation: animation.export()
    })
  },
  refresh: function () {
    wx.startPullDownRefresh({
    })
  },
  wxChooseImg: function(type) {
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: [type], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(res)
        console.log(tempFilePaths)
        wx.navigateTo({ url: `/page/album/pages/upload-batch/upload-batch?shared_album_id=${shared_album_id}&localpath=${tempFilePaths.join(',')}` })
      }
    })
  },
  postAndSetBatchList: function (callback, fromFresh) {
    const self = this
    app.apiIndexPost(
      'batch_list',
      { shared_album_id, index: batch_index },
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

          //根据图片数量定义图片的宽高
          self.dealWithPicsWidth(item.pic_list.length, item)
        })
        let album_batch_list = self.data.album_batch_list
        if (fromFresh) {
          album_batch_list = res.album_batch_list
        } else {
          album_batch_list = album_batch_list.concat(res.album_batch_list)
        }
        
        self.setData({
          album_batch_list: album_batch_list
        }, function() {
          if (callback) {
            callback(res)
          }
        })
        
      }
    )
  },
  showAlbumDetail: function () {
    const self = this
    app.apiIndexPost('getAlbumDetail', { shared_album_id }, function (res) {
      my_nick = res.my_nick
      self.setData({ albumDetail: res, changeTitleText: res.shared_album_title })
    })
    self.postAndSetBatchList()
  }
})