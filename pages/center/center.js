//获取应用实例
const app = getApp()
var base64 = require("../images/base64");
import { promisify } from '../login/promisify';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nick: '未登录',
    label: '点击去登录',
    flower: '小红花 0 朵',
    photo: '../images/pic_160.png',
    registerTime: '',
    userName: '',
    wx: '',
    lock: false,
    btn_visible: 'display:none',
    pictures: [],
  },

  loginout: async function() {
    try {
      await promisify(tt.clearStorage);
      this.setData({
        nick: '未登录',
        label: '点击去登录',
        flower: '小红花 0 朵',
        photo: '../images/pic_160.png',
        registerTime: '',
        userName: '',
        wx: '',
        lock: false,
        btn_visible: 'display:none',
        pictures: [],
      });
      app.globalData.userId = '';
      app.globalData.nick = '';
      app.globalData.refreshIndex = true;
    } catch (err) {
      console.error('退出登录失败:', err);
    }
  },

  login: function() {
    if (this.data.nick == '未登录' && this.data.label == '点击去登录') {
      tt.navigateTo({
        url: '../login/login',
      });
    } else {
      this.previewImage();
    }
  },

  previewImage: async function() {
    try {
      await promisify(tt.previewImage, {
        current: this.data.pictures[0],
        urls: this.data.pictures
      });
    } catch (err) {
      console.error('预览图片失败:', err);
    }
  },

  switchChange: async function(e) {
    if (e.detail.value) {
      tt.navigateTo({
        url: '../lock/lock',
      });
    } else {
      try {
        await promisify(tt.removeStorage, { key: 'lock' });
      } catch (err) {
        console.error('移除锁定失败:', err);
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    app.globalData.refreshIndex = false;
  },

  help: function() {
    tt.navigateTo({
      url: '../about/help',
    });
  },

  about: function() {
    tt.navigateTo({
      url: '../about/about',
    });
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      // 使用 Promise.all 并行获取所有存储的信息
      const [
        nick,
        createdAt,
        qmd,
        flower,
        photo,
        username,
        lock
      ] = await Promise.all([
        promisify(tt.getStorage, { key: 'nick' }).catch(() => ({ data: '未登录' })),
        promisify(tt.getStorage, { key: 'createdAt' }).catch(() => ({ data: '' })),
        promisify(tt.getStorage, { key: 'qmd' }).catch(() => ({ data: '点击去登录' })),
        promisify(tt.getStorage, { key: 'flower' }).catch(() => ({ data: '0' })),
        promisify(tt.getStorage, { key: 'photo' }).catch(() => ({ data: '../images/pic_160.png' })),
        promisify(tt.getStorage, { key: 'username' }).catch(() => ({ data: '' })),
        promisify(tt.getStorage, { key: 'lock' }).catch(() => ({ data: '' }))
      ]);

      // 更新页面数据
      this.setData({
        nick: nick.data,
        registerTime: createdAt.data,
        label: qmd.data,
        flower: '小红花' + flower.data + '朵',
        photo: photo.data,
        pictures: [photo.data],
        userName: username.data,
        lock: lock.data?.length === 4,
        btn_visible: nick.data !== '未登录' ? '' : 'display:none'
      });

      console.log('用户信息加载完成:', this.data);
    } catch (err) {
      console.error('加载用户信息失败:', err);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.loadUserInfo();
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

  }
})