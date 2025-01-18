//index.js
//获取应用实例
const app = getApp();
import { request, promisify } from '../login/promisify';

// #d7d6dc
Page({
  data: {
    isHideLoadMore: true,
    pageCount: 60,
    page: 0,
    user: {},
    visible: '',
    listData: [],
    refresh: false,
  },
  toRead: function(e) {
    var id = e.currentTarget.dataset.objectid;
    wx.navigateTo({
      url: '../read/read?id=' + id,
    })
  },

  loginAPI: function() {
    app.globalData.API.User.login('8@qq.com', '123').then(res => {
      console.log(res),
        this.setData({
          user: res,
        })
      console.log(this.data.user)
    }).catch(err => {
      console.log(err)
    });
  },

  async getList(refresh) {
    try {
      // 从本地存储获取笔记列表
      const res = await promisify(tt.getStorage, { key: 'noteList' });
      const noteList = res.data || [];
      
      // 过滤当前用户的笔记
      const userNotes = noteList.filter(note => note.userId === app.globalData.userId);

      if (refresh) {
        await promisify(tt.stopPullDownRefresh); //停止下拉刷新
        // 添加索引
        const listWithIndex = userNotes.map((item, index) => ({
          ...item,
          index: index + 1
        }));

        this.setData({
          listData: listWithIndex,
        });
      } else {
        this.setData({
          isHideLoadMore: true,
        });

        if (userNotes.length === 0) {
          await promisify(tt.showToast, {
            title: '没有更多数据啦~',
            icon: 'none'
          });
          return;
        }

        // 添加索引
        const newItems = userNotes.map((item, index) => ({
          ...item,
          index: this.data.listData.length + index + 1
        }));

        this.setData({
          listData: this.data.listData.concat(newItems),
        });
      }

      this.data.page++;
    } catch (err) {
      console.error('获取列表失败:', err);
      await promisify(tt.showToast, {
        title: '获取数据失败',
        icon: 'none'
      });
    }
  },

  onPullDownRefresh: function() {
    this.setData({
      page: 0,
      refresh: true,
    })
    if (app.globalData.userId.length < 1) {
      this.setData({
        visible: ''
      })
    } else {
      this.setData({
        visible: 'display:none'
      })
    }
    this.getList(true);
  },

  onReachBottom: function() {
    if (this.data.page > 0) {
      this.setData({
        isHideLoadMore: false,
      })
      this.getList(false);
    }
  },

  onShow: function() {
    if (!app.globalData.refreshIndex) {
      return
    }
    wx.startPullDownRefresh();
    this.onPullDownRefresh();
  },

  toSearch: function() {
    wx.navigateTo({
      url: '../search/search',
      success: function() {},
      fail: function() {},
      complete: function() {}
    })
  },

  async onMenu(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const objectId = e.currentTarget.dataset.objectid;

    try {
      const { tapIndex } = await promisify(tt.showActionSheet, {
        itemList: ['编辑', '删除', '复制']
      });

      switch (tapIndex) {
        case 0:
          await promisify(tt.showToast, {
            title: '编辑功能暂未开放~',
            icon: 'none'
          });
          break;
        case 1:
          // 删除笔记
          const deleteRes = await request({
            url: '/api/note/delete',
            method: 'POST',
            data: {
              noteId: objectId
            }
          });

          if (deleteRes.data.success) {
            await promisify(tt.showToast, {
              title: '删除成功~',
            });
            // 更新列表
            that.data.listData.splice(index - 1, 1);
            that.data.listData.forEach((item, i) => {
              item.index = i + 1;
            });
            that.setData({
              listData: that.data.listData
            });
          }
          break;
        case 2:
          await promisify(tt.showToast, {
            title: '复制成功~',
          });
          await promisify(tt.setClipboardData, {
            data: that.data.listData[index - 1].content
          });
          break;
      }
    } catch (err) {
      console.error('操作失败:', err);
    }
  },

  toWrite: function() {
    // 从本地存储获取用户ID
    const userId = tt.getStorageSync('userId');
    if (!userId) {
      tt.showToast({
        title: '请登录~',
        icon: 'none'
      });
      return;
    }
    tt.navigateTo({
      url: '../write/write'
    });
  },
  onLoad: function() {
    if (app.globalData.lockCount > 0) {
      return;
    }
    // 从本地存储获取用户信息
    try {
      const userId = tt.getStorageSync('userId');
      if (userId) {
        app.globalData.userId = userId;
        this.setData({
          visible: 'display:none'
        });
      } else {
        this.setData({
          visible: ''
        });
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
    }
    this.isLock();
  },

  isLock: function() {
    try {
      const lock = tt.getStorageSync('lock');
      if (lock && lock.length > 0) {
        tt.redirectTo({
          url: '../unlock/unlock',
        });
      }
    } catch (err) {
      console.error('检查锁定状态失败:', err);
    }
  },
})