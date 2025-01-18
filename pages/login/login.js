// 引入 promisify 工具
import { promisify, request } from './promisify';

//获取应用实例
const app = getApp();

Page({
  data: {
    phone: '',
    password: '',
    user: {},
    imageUrl: '../images/ic_launcher.png',
    douyin_code: '',
    isDeveloperServerLogin: false,  // 是否登录开发者服务端
    isDouyinLogin: false,  // 是否登录抖音主端
  },

  // 获取输入账号 
  phoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  onShow: function() {
    // 页面显示时尝试静默登录
    this.silentLogin(false);
  },

  register: function() {
    tt.navigateTo({
      url: '../register/register',
    });
  },

  // 获取输入密码 
  passwordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  async queryUser(openId) {
    try {
      const res = await request({
        url: '/api/user/query',
        method: 'POST',
        data: {
          openId: openId,
          username: '8@qq.com'  // 这里可能需要修改为动态值
        }
      });

      console.log("查询用户结果:", res.data);
      
      if (res.data.exists) {
        await promisify(tt.showToast, {
          title: '已被注册',
          icon: 'none',
          duration: 1000
        });
      } else {
        await promisify(tt.showToast, {
          title: '可以注册',
          icon: 'success',
          duration: 1000
        });
        this.register();
      }
    } catch (err) {
      console.error('查询用户失败:', err);
      await promisify(tt.showToast, {
        title: '查询失败',
        icon: 'none',
        duration: 1000
      });
    }
  },

  // 静默登录
  async silentLogin(force = false) {
    if (this.data.isDeveloperServerLogin) {
      return;
    }
    
    let loginData = null;
    try {
      // 是否强制调起抖音的登录窗口
      loginData = await promisify(tt.login, { force });
      this.setData({ isDouyinLogin: loginData.isLogin });
      console.log('抖音登录结果:', loginData);
      
      if (this.data.isDouyinLogin && loginData.code) {
        const loginSuccess = await this.loginToDeveloperServer(loginData.code);
        if (loginSuccess) {
          // 登录成功后跳转
          setTimeout(() => {
            tt.switchTab({
              url: '../center/center',
            });
          }, 1000);
        }
      }
    } catch (err) {
      console.error('登录失败:', err);
      if (!force) { // 只在非强制登录时隐藏错误提示
        return false;
      }
      await promisify(tt.showToast, {
        title: err.message || '登录失败',
        icon: 'none',
        duration: 1000
      });
      return false;
    }
    
    return this.data.isDouyinLogin;
  },

  // 手动登录按钮点击
  async login() {
    // 直接调用 silentLogin，但强制显示登录窗口
    await this.silentLogin(true);
  },

  // 请求开发者服务器登录
  async loginToDeveloperServer(code) {
    try {
      await promisify(tt.showLoading, { title: '登录中...' });
      const res = await request({
        url: '/api/apps/login',
        method: 'POST',
        data: {
          code: code
        }
      });

      console.log('开发者服务器登录响应:', res.data);
      
      if (res.data.errCode === 0) {
        // 保存登录凭证
        tt.setStorageSync('token', res.data.token);
        tt.setStorageSync('openid', res.data.openid);
        tt.setStorageSync('unionid', res.data.unionid);
        
        // 重要：设置全局用户ID
        app.globalData.userId = res.data.openid;
        tt.setStorageSync('userId', res.data.openid);
        
        // 设置登录状态
        this.setData({ 
          isDeveloperServerLogin: true,
          user: {
            objectId: res.data.openid,
            // 其他用户信息...
          }
        });
        
        // 保存用户信息
        await this.saveUserInfo();
        
        await promisify(tt.showToast, {
          title: res.data.errMsg || '登录成功',
          icon: 'success',
          duration: 1000
        });
        
        // 设置全局刷新标志
        app.globalData.refreshIndex = true;
        
        return true;
      } else {
        throw new Error(res.data.errMsg || '登录失败');
      }
    } catch (err) {
      console.error('服务器登录失败:', err);
      await promisify(tt.showToast, {
        title: err.message || '登录失败',
        icon: 'none',
        duration: 1000
      });
      return false;
    } finally {
      await promisify(tt.hideLoading);
    }
  },

  // 保存用户信息
  async saveUserInfo() {
    const userInfo = {
      objectId: tt.getStorageSync('openid'),
      nick: '抖音用户',  // 可以从抖音获取的用户信息中获取
      qmd: '这个人很懒，什么都没写',
      flower: '0',
      photo: '../images/pic_160.png',
      username: tt.getStorageSync('openid'),
      createdAt: new Date().toISOString()
    };
    
    app.globalData.user = userInfo;
    app.globalData.userId = userInfo.objectId;
    app.globalData.nick = userInfo.nick;
    app.globalData.refreshIndex = true;
    
    // 保存所有用户相关信息
    await Promise.all([
      promisify(tt.setStorage, { key: 'userId', data: userInfo.objectId }),
      promisify(tt.setStorage, { key: 'nick', data: userInfo.nick }),
      promisify(tt.setStorage, { key: 'qmd', data: userInfo.qmd }),
      promisify(tt.setStorage, { key: 'flower', data: userInfo.flower }),
      promisify(tt.setStorage, { key: 'photo', data: userInfo.photo }),
      promisify(tt.setStorage, { key: 'username', data: userInfo.username }),
      promisify(tt.setStorage, { key: 'createdAt', data: userInfo.createdAt })
    ]);
  },
})