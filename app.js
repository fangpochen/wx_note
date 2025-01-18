//app.js

App({

  onShow: function() {

  },
  onHide: function() {

  },
  onLaunch: function() {
    var that = this;
    
    // 获取系统信息
    tt.getSystemInfo({
      success: function(res) {
        that.globalData.platform = res.platform;
        that.globalData.windowHeight = res.windowHeight;
      }
    });

    // 启动时检查登录状态
    try {
      // 从本地存储获取用户信息
      const [userId, nick] = [
        tt.getStorageSync('userId'),
        tt.getStorageSync('nick')
      ];
      
      if (userId) {
        this.globalData.userId = userId;
        this.globalData.nick = nick || '';
        this.globalData.refreshIndex = true;
        
        console.log('已获取到用户信息:', {
          userId: this.globalData.userId,
          nick: this.globalData.nick
        });
      } else {
        console.log('未找到用户登录信息');
      }
    } catch (err) {
      console.error('检查登录状态失败:', err);
    }
  },
  globalData: {
    userInfo: null,
    userId: '',
    nick: '',
    platform: '',
    refreshIndex: true,
    lock: false,
    lockCount: 0,
    windowHeight: 0,
    user: {},
  }
})