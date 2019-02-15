// page/album/pages/member/member.js
const app=getApp();
let shared_album_id, itemuserId="", itemmember="", radioValue=""
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    char_lt: "<",
    //成员数
    memberCount:1,
    is_manager:1,
    //
    hiddeMemberSetting:true,
    //成员列表测试数据
    items:[],
    searchkey:''
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
    const self = this
    app.apiIndexPost('album_member_post', { shared_album_id: shared_album_id },
      function (res) {
        res.album_user_list.forEach(function(item){
          item.isShow = true
        })
        self.setData({ items: res.album_user_list })
      }
    )
  },
  bindKeyInput:function(e) {
    this.setData({ searchkey : e.detail.value})
  },
  bindconfirm:function() {
    const searchkey = this.data.searchkey
    let items = this.data.items
    items.forEach(function(item){
      item.isShow = false
      if (item.nick_name.indexOf(searchkey) >= 0) {
        item.isShow = true
      }
    })
    this.setData({ items })
  },
  invite:function() {
    console.lo
  },
  memberSetBox:function(e){
    // var viewDataSet = e.currentTarget.dataset;
    // itemuserId = viewDataSet.text;
    // itemmember = viewDataSet.member;
    // console.log("itemmember", itemmember);
    // this.setData({hiddeMemberSetting: !this.data.hiddeMemberSetting,
    //   confirmBoxText: itemmember }
    //               );
  },

  //取消按钮
  confirmBoxCancel: function () {
    this.setData({ hiddeMemberSetting: true ,
                   radioValue:""})
  },
  
  //确认按钮 
  confirmBoxConfirm: function () {
    if (radioValue=="check"){ this.setData({ hiddeMemberSetting: true });}
    else if (radioValue=="delete"){ this.setData({ hiddeMemberSetting: true }); }
    else if (radioValue=="transfer"){ this.setData({ hiddeMemberSetting: true }); }
    else {//每当这个时候不知道做点什么好....
      }
    radioValue="";
  },
  
  radioChange: function changeValue(e) {
    console.log(e);
    radioValue =e.detail.value; 
    console.log("radioValue:", radioValue);
  },
  onShareAppMessage: function (res) {
    return {
      title: '加入我的相册吧！',
      path: `/page/authorize?topage=detail&shared_album_id=${shared_album_id}&invite=1`
    }
  },
})