// pages/organize/organize.js
function inArray(arr, key, val) {
  console.log("arr:" + arr + "  key:" + key + " val:" + val)
  for (let i = 0; i < arr.length; i++) {
    console.log("arr[i][key]:" + arr[i][key])
    console.log("arr[i]:" + arr[i])
    console.log("arr[i][key] === val:" + arr[i][key] === val)
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    blueToothList: [],
    scanning: false,
    ifdelay:false,
    timelong:30,
    height: 1000,
    currentTab:0,
    bt:true,
    motto:"正在搜索附近的蓝牙信标..."
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let windowHeight = wx.getSystemInfoSync().windowHeight; // 屏幕的高度
    console.log(windowHeight)
    let query = wx.createSelectorQuery();
    var that = this
    query.select('.formHead').boundingClientRect(rect => {
      let contheight = windowHeight - rect.height;
      that.setData({
        height: contheight
      });
    }).exec();
    

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.openBluetoothAdapter();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

// 是否采用定时任务
  ifdelay(e){
    this.setData({ ifdelay: e.detail.value })
  },

// 设置时长
  settimelong(e){
    this.setData({ timelong: e.detail.value })
  },

// swiper跳转
  nextstep(e){
    this.setData({
      currentTab: e.target.dataset.current
    })
  },

  // 签到方式发生改变
  modeChange: function (e) {
    var that = this
    if (e.detail.value){
      that.setData({
        bt: e.detail.value
      })
      that.openBluetoothAdapter();
    }else{
      that.setData({
        bt: e.detail.value
      })
      that.closeBluetoothAdapter
    }
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },

/**
 * 蓝牙逻辑，搜索附近信标并显示在列表中
 */
openBluetoothAdapter() {
    console.log(' ====>  正在初始化小程序蓝牙模块...')
    this.setData({
      scanning: true
    })
    var that = this
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log(' ====>  初始化小程序蓝牙模块成功', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: function (res) {
        console.log(' ====>  初始化小程序蓝牙模块失败，可能是蓝牙开关未打开', res)
        that.setData({
          motto: "请打开蓝牙开关"
        })
        var thatt = that
        wx.onBluetoothAdapterStateChange(function (res) {
          console.log(' ====>  开始监听蓝牙适配器状态是否有变化', res)
          if (res.available) {
            thatt.setData({
              motto: "搜索中..."
            })
            console.log(' ====>  监听到蓝牙适配器状态变化：目前可用', res)
            console.log(' ====>  开始搜寻附近的蓝牙外围设备...')
            thatt.startBluetoothDevicesDiscovery()
          }
        })
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) { //防止重复调用
      console.log(" ====>  已经开始搜索附近的蓝牙设备")
      return
    }
    this.setData({
      motto: "搜索中..."
    })
    console.log(" ====>  开始搜索附近的蓝牙设备...")
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true, //是否允许重复上报同一设备， 如果允许重复上报，则onDeviceFound 方法会多次上报同一设备，但是 RSSI 值会有不同
      success: (res) => { //成功则返回本机蓝牙适配器状态
        console.log(' ====>  开始搜索附近的蓝牙设备成功，监听寻找到新设备的事件', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() { //停止搜寻附近的蓝牙外围设备。若已经找到需要的蓝牙设备并不需要继续搜索时，建议调用该接口停止蓝牙搜索。
    console.log(' ====>  停止搜寻附近的蓝牙外围设备')
    wx.stopBluetoothDevicesDiscovery()
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => { //监听寻找到新设备的事件
      console.log(' ====>  正在监听寻找到新设备的事件...')
      res.devices.forEach(device => {
        console.log("device.name:" + device.name + "device.localName:" + device.localName)
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.blueToothList
        console.log(" ====>  foundDevices" + foundDevices)
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`blueToothList[${foundDevices.length}]`] = device
        } else {
          data[`blueToothList[${idx}]`] = device
        }
        console.log(' ====>  关闭搜索、关闭蓝牙')
        this.stopBluetoothDevicesDiscovery()
        this.closeBluetoothAdapter()
        console.log(' ====>  正在更新列表')
        this.setData({
          motto: "请选择要使用的蓝牙信标",
          scanning: false
        })
        this.setData(data)
      })
      fail: (res) => {
        this.setData({
          motto: "未找到附近的蓝牙信标",
          scanning: false
        })
      }
    })
  },
  closeBluetoothAdapter() {
    console.log(' ====>  关闭蓝牙模块')
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },


})