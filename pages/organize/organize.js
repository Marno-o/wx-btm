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

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    blueToothList: [],
    scanning: false,
    startdate: "",
    starttime: "",
    date: "",
    time: "",
    addressMeta:"custom",
    addressInfo:"点击选择地图上的地点",
    ifdelay: false,
    ifRegister: true,
    allowForward:true,
    timelong: 30,
    height: 1000,
    currentTab: 0,
    ifbt: true,
    motto: "正在搜索附近的蓝牙信标..."
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      userInfo: app.globalData.userInfo,
    })
    console.log(this.data.userInfo)
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
    //获取当前时间
    this.getNowFormatDate()
  },

  getNowFormatDate: function() { //获取当前时间
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    var strDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    var currenttime = hour + seperator2 + minute;
    this.setData({
      starttime: currenttime,
      time: currenttime,
      startdate: currentdate,
      date: currentdate
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.openBluetoothAdapter();
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

  //需要报名
  ifRegister: function(e) {
    this.setData({
      ifRegister: e.detail.value,
      allowForward: true
    })
  },

//二次转发
  allowForwardChange: function (e) {
    this.setData({
      allowForward: e.detail.value
    })
  },

  // 是否采用定时任务
  ifdelay(e) {
    this.setData({
      ifdelay: e.detail.value
    })
  },

  /**
   * 改变日期
   */
  DateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },

  /**
   * 改变时间
   */
  TimeChange: function(e) {
    this.setData({
      time: e.detail.value
    })
  },

  // 设置时长
  settimelong(e) {
    this.setData({
      timelong: e.detail.value
    })
  },

  // swiper跳转
  nextstep(e) {
    this.setData({
      currentTab: e.target.dataset.current
    })
  },

  
  // 地图模式发生改变
  changeAddressMeta: function(e) {
    var that = this
    if (e.detail.value == "getFromMap") {
      //可能需要弹窗提示
    }
    this.setData({
      addressMeta: e.detail.value
    })
    console.log('address发生change事件，携带value值为：', e.detail.value)
  },

  // 签到方式发生改变
  modeChange: function(e) {
    var that = this
    that.setData({
      ifbt: e.detail.value
    })
    if (e.detail.value == 1) {
      that.openBluetoothAdapter();
      console.log(that.data.ifbt)
    } else {
      that.closeBluetoothAdapter()
      console.log(that.data.ifbt)
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
      fail: function(res) {
        console.log(' ====>  初始化小程序蓝牙模块失败，可能是蓝牙开关未打开', res)
        that.setData({
          motto: "请打开蓝牙开关"
        })
        var thatt = that
        wx.onBluetoothAdapterStateChange(function(res) {
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

  /**
   * submit
   */
  subform: function(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var that = this
    // 场景主题
    if (e.detail.value.theme == "") {
      var thatt = that
      wx.showModal({
        title: '请输入主题名称！',
        showCancel: false,
        confirmText: "好",
        success: function(res) {
          thatt.setData({
            currentTab: 0
          })
        }
      })
    } else if (e.detail.value.hoster == "") {
      var thatt = that
      wx.showModal({
        title: '请输入主持人！！',
        showCancel: false,
        confirmText: "好",
        success: function (res) {
          thatt.setData({
            currentTab: 0
          })
        }
      })
    } else if (e.detail.value.address == "") {
      var thatt = that
      wx.showModal({
        title: '请输入地点！！',
        showCancel: false,
        confirmText: "好",
        success: function (res) {
          thatt.setData({
            currentTab: 0
          })
        }
      })
    } else if (e.detail.value.mode == "1") {
      var that = this
      if (e.detail.value.deviceId == "") {
        wx.showModal({
          title: '请选择蓝牙信标',
          showCancel: false,
          confirmText: "好"
        })
      } else {
        var thatt = that
        wx.showLoading({
          title: '请稍候...',
        })
        wx.request({
          url: app.globalData.host + '/makescene',
          method: 'post',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            originatorID: thatt.data.userInfo.userID,
            userPic: thatt.data.userInfo.avatarUrl,
            userName: thatt.data.userInfo.userName,
            theme: e.detail.value.theme,
            hoster: e.detail.value.hoster,
            starttime: e.detail.value.starttime,
            startdate: e.detail.value.startdate,
            timelong: e.detail.value.timelong,
            address: e.detail.value.address,
            ifRegister: e.detail.value.ifRegister,
            mymessage: e.detail.value.mymessage,
            mode: e.detail.value.mode,
            deviceId: e.detail.value.deviceId
          },
          success: data => {
            wx.hideLoading()
            if(data.data.motto == 1){
              var newsceneID = data.data.newsceneID
              wx.showModal({
                title: '新建成功，即将跳转个人页面',
                showCancel: false,
                confirmText: "好",
                success: function (res) {
                  wx.redirectTo({
                    url: '../scene/scene?sceneID=' +newsceneID,
                  })
                }
              })
            } else if (data.data.motto == 2) {
              wx.showModal({
                title: '新建任务失败',
                content: '这个信标已经被你用过啦，先停止它的任务吧！',
                showCancel: false,
                confirmText: "好"
              })
            } else if (data.data.motto == 3){
              wx.showModal({
                title: '新建任务失败',
                content: '这个信标已经被别人用啦，换个信标试试吧！',
                showCancel: false,
                confirmText: "好"
              })
            }else{
              wx.showModal({
                title: '新建任务失败',
                content: '未知错误，请重试',
                showCancel: false,
                confirmText: "好"
              })
            }
          },
          fail: data => {
            wx.hideLoading()
            wx.showModal({
              title: '新建任务失败',
              content:'可能是网络连接出错，请重试',
              showCancel: false,
              confirmText: "好"
            })
          }
        })
      }
    } else {
      console.log("签到方式:" + e.detail.value.mode)
    }
  }
})