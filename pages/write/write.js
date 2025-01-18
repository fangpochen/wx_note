//获取应用实例
const app = getApp();
import { promisify, request } from '../login/promisify';

Page({
  data: {
    content: '',
    isHide: true,
    isLock: false,
    isOpen: false,
    isTop: false,
    isHideLoadMore: true,
  },

  onLoad: function() {
    this.setData({
      isHide: true,
      isLock: false,
      isOpen: false,
      isTop: false,
    });
  },

  // 获取输入内容
  contentInput: function(e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 提交笔记
  async onSubmit(e) {
    if (this.data.content.length == 0) {
      await promisify(tt.showToast, {
        title: '内容不能为空',
        icon: 'none',
        duration: 1000
      });
      return;
    }
    
    try {
      await this.send();
      
      await promisify(tt.showToast, {
        title: '保存成功',
        icon: 'success',
        duration: 1000
      });

      setTimeout(() => {
        tt.navigateBack({
          delta: 1
        });
      }, 1000);
    } catch (err) {
      console.error('保存笔记失败:', err);
      await promisify(tt.showToast, {
        title: '保存失败',
        icon: 'none',
        duration: 1000
      });
    }
  },

  // 发送笔记到服务器
  async send() {
    try {
      // 获取当前时间
      const now = new Date();
      const dateString = now.toISOString();
      
      // 构建笔记数据
      const noteData = {
        content: this.data.content,
        isLock: this.data.isLock,
        isOpen: this.data.isOpen,
        isTop: this.data.isTop,
        userId: app.globalData.userId,
        createdAt: dateString,
        updatedAt: dateString,
        objectId: `note_${Date.now()}` // 生成临时ID
      };

      // 获取已有的笔记列表
      let noteList = [];
      try {
        const res = await promisify(tt.getStorage, { key: 'noteList' });
        noteList = res.data || [];
      } catch (err) {
        // 如果没有存储过笔记，使用空数组
        console.log('没有找到已存储的笔记');
      }

      // 将新笔记添加到列表开头
      noteList.unshift(noteData);

      // 保存更新后的笔记列表
      await promisify(tt.setStorage, {
        key: 'noteList',
        data: noteList
      });

      // 更新全局状态
      app.globalData.refreshIndex = true;

      return {
        success: true,
        data: noteData
      };
    } catch (err) {
      console.error('保存笔记失败:', err);
      throw err;
    }
  },

  // 开关切换
  switchChange: function(e) {
    const type = e.currentTarget.dataset.type;
    switch (type) {
      case 'lock':
        this.setData({ isLock: e.detail.value });
        break;
      case 'open':
        this.setData({ isOpen: e.detail.value });
        break;
      case 'top':
        this.setData({ isTop: e.detail.value });
        break;
    }
  },

  onShow: function() {
    // 检查是否登录
    const userId = tt.getStorageSync('userId');
    if (!userId) {
      tt.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500
      });
      setTimeout(() => {
        tt.navigateBack();
      }, 1500);
    }
  }
});