// pages/detail/detail.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    way: "",
    width:400,
    height: 1000,
    current: 0,
    listNull:false,
    sceneListReady: [],
    sceneListDone: [],
    triggered:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    let windowHeight = wx.getSystemInfoSync().windowHeight; // 屏幕的高度
    let query = wx.createSelectorQuery();
    query.select('.tab').boundingClientRect(rect => {
      let contantheight = windowHeight - rect.height;
      this.setData({
        height: contantheight,
        width: wx.getSystemInfoSync().windowWidth / 2,
      });
      console.log(">>>" + rect.height)
    }).exec();
    this.setData({
        way : options.way
    });
    console.log(wx.getSystemInfoSync().windowWidth)
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    setTimeout(() => {
      this.setData({
        triggered: true,
      })
    }, 50)
  },

  onPulling(e) {
    console.log('onPulling:', e)
  },

  onRefresh() {
    if (this._freshing) return
    this._freshing = true
    setTimeout(() => {
      this.setData({
        triggered: false,
      })
      this._freshing = false
    }, 1000)
  },

  onRestore(e) {
    console.log('onRestore:', e)
  },

  onAbort(e) {
    console.log('onAbort', e)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.way == "organized"){
      this.getSceneListReady()
      this.getSceneListDone()
    } else if (way == "registed"){
      //找已报名的
    }
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  getSceneListReady: function() {
    var that = this
    if (app.globalData.ifUserSign) {
      wx.request({
        url: app.globalData.host + '/getscenebyoid/ready',
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          originatorID: app.globalData.userInfo.userID
        },
        success: data => {
          console.log(data.data)
          if (data.data){
            that.setData({
              current: 1,
              listNull:true
            })
          }else{
            that.setData({
              sceneListReady: data.data
            })
          }
          console.log(that.data.current)
        }
      })
    }
  },

  getSceneListDone: function() {
    var that = this
    if (app.globalData.ifUserSign) {
      wx.request({
        url: app.globalData.host + '/getscenebyoid/done',
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          originatorID: app.globalData.userInfo.userID
        },
        success: data => {
          console.log(data.data)
          that.setData({
            sceneListDone: data.data
          })
          console.log(that.data.sceneListDone)
        }
      })
    }
  },

  scene: function(e) {
    wx.navigateTo({
      url: '../scene/scene?sceneID=' + e.currentTarget.dataset.id
    })
  },

  currentChanged(e){
    var that = this
    if (e.detail.source == "touch"){
      that.setData({
        current: e.detail.current
      })
    }
    
  },

  clicktab:function(e){
    this.setData({
      current: e.currentTarget.dataset.id
    })
  }
})