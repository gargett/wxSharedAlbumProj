const app = getApp()
let piclibIndex = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    editMode:false,
    picList:[],
    isLoading:false,
    uploadProgress:0,
    confirmBox: {
      title: '',
      content: '',
      isShow: false,
      cancelText: '取消',
      confirm: '确认',
      cancelEvent: "_cancelEvent",
      confirmEvent: "_confirmEvent"
    }
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
    const self = this
    self.postAndSetPiclibList()
  },
  onReachBottom: function () {
    const self = this
    this.setData({  isLoading: true  }, function () {
      piclibIndex++
      self.postAndSetPiclibList(function (res) {
        if (res.photo_list == 0) {
          piclibIndex = 10000
        }
        self.setData({ isLoading: false })
      })
    })
  },
  toggleEditMode:function() {
    let picList = this.data.picList
    const self = this
    picList.forEach(function (item) {
      item.isSelected = false
    })
    this.setData({ editMode: !this.data.editMode, picList }, function(){
      
    })
  },
  selectPic:function(e) {
    let picList = this.data.picList
    const idx = e.currentTarget.dataset.idx
    picList[idx].isSelected = !picList[idx].isSelected
    this.setData({ picList: picList})
  },
  delectPicLibImgs:function() {
    const self = this
    app.wxShowModal('提示','删除图片',function(){
      self.confirmDelectPicLibImgs()
    })
  },
  confirmDelectPicLibImgs:function() {
    let picList = this.data.picList,
        pics = [],
        picListNew = []
    picList.forEach(function (item, index) {
      if(item.isSelected) {
        pics.push(item.picture_id)
      } else {
        picListNew.push(item)
      }
    })
    this.setData({ picList:picListNew })
    app.apiIndexPost('delFromGallery', { picIds: pics.join(',') }, function (res) {
    })
  },
  piclibUpload:function() {
    const self = this
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album','camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        let picList = self.data.picList,
            filePaths = []
        tempFilePaths.forEach(function(item){
          filePaths.push({ locate_path: item, isSelected: false, picture_id:'0'})
        })
        console.log(picList.concat(filePaths))
        self.setData({ picList: filePaths.concat(picList) })

        self.uploadFile(tempFilePaths)
      }
    })
  },
  postAndSetPiclibList:function(callback) {
    const self = this
    app.apiIndexPost('photo_gallery', { index: piclibIndex }, function (ret) {
      ret.photo_list.forEach(function (item) {
        item.isSelected = false
        item.locate_path = `http://bigdata.drpeng.com.cn/album_static/${item.locate_path}`
      })
      let picList = self.data.picList
      picList = picList.concat(ret.photo_list)
      self.setData({ picList }, function(){
        if (callback)
        callback(ret)
      })
    })
  },
  uploadFile: function (tempFilePaths) {
    const self = this
    for(let i = 0, len = tempFilePaths.length; i < len; i++) {
      wx.uploadFile({
        url: app.globalData.apiUrl,
        filePath: tempFilePaths[i],
        name: 'image',
        formData: {
          oper: 'uploadToMyGalleryXcc',
          openid: app.globalData.openid,
          csrfmiddlewaretoken: 'wX3DQlLtXGqVobKvLRs2HD9ym5J4AaKJ',
          index: i
        },
        header: {
          "Content-Type": "multipart/form-data"
        },
        success: function (res) {
          console.log(res)
        }
      })
    }
  }
})