<template>
  <div class="personal-main">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="grid-content bg-purple">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>
                <el-avatar :size="70" :src="userInfo.avatar" style="vertical-align: middle;"></el-avatar>
                <b style="margin-left: 20px;font-size: 20px;">{{userInfo.name}}</b>
              </span>
            </div>
            <div  class="text item">
              <b>登录账号: </b><span class="txt1">{{userInfo.username}}</span>
            </div>
            <div  class="text item">
              <b>商户余额: </b><span class="txt1" style="color: #32CD32;font-weight: bold;">{{userInfo.balance}}</span>
            </div>
            <div  class="text item">
              <b>商户号: </b><span class="txt1">{{userInfo.mId}}</span>
            </div>
            <div  class="text item">
              <b>商户密钥: </b><span class="txt1">{{userInfo.mKey}}</span>
              <el-button type="text" style="padding: 0;margin-left: 10px;" @click="lookKey">查看</el-button>
              <el-button
                type="text"
                v-if="isShowCopy"
                style="padding: 0;margin-left: 10px;"
                v-clipboard:copy="showMkey"
            　　v-clipboard:success="copySuccess"
            　　v-clipboard:error="copyError">
                复制
              </el-button>
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="grid-content bg-purple">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>谷歌验证</span>
            </div>

              <div class="text item">
                <label style="color: #555;margin-right: 10px;">验证开关</label>
                <el-switch
                  v-model="userInfo.googleStatus"
                  active-color="#13ce66"
                  inactive-color="#aaa"
                  :active-value="1"
                  :inactive-value="0"
                  @change="updateGoogleSwitch()">
                </el-switch>
              </div>
              <div v-if="visibleGoogle">
                <div class="text item" style="font-size:15px;">绑定谷歌验证器: </div>
                <div class="text item">
                  <span style="font-weight: bold;">步骤一: </span>打开手机谷歌验证器扫描下方二维码添加账户
                </div>
                <div class="text item">
                  <div id="qrcode" style="margin-left: 50px;"></div>
                </div>
                <div class="text item">
                  <span style="font-weight: bold;">步骤二: </span>如扫码失败, 手动将下方密钥输入谷歌验证器 (扫码成功忽略此步骤)
                </div>
                <div class="text item">
                  <el-input placeholder="谷歌密钥" size="small" readonly v-model="userInfo.googleSecret" style="width: 280px;">
                    <template slot="prepend">谷歌密钥</template>
                  </el-input>
                  <el-button
                    type="primary"
                    size="mini"
                    v-clipboard:copy="userInfo.googleSecret"
                　　v-clipboard:success="copySuccess"
                　　v-clipboard:error="copyError">
                    复制
                  </el-button>
                </div>
                <div class="text item">
                  <span style="font-weight: bold;">步骤三: </span>登录时将谷歌验证器中的验证码输入网站即可
                </div>
              </div>

          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>

</template>

<script>
import { getImpInfo, updateGoogleStatus } from '@/api/user'
import QRCode from "qrcodejs2";

export default {
  name: 'Personal',
  components: { QRCode },
  data() {
    return {
      showMkey: '',
      isShowCopy: false,
      visibleGoogle: false,
      userInfo: {
        name: '',
        avatar: '',
        balance: 0,
        googleStatus: 0,
        googleCode: '',
        googleSecret: '',
        mId: '',
        mKey: ''
      }
    }
  },
  created() {
    this.getUserInfoImp()
  },
  mounted() {

  },
  watch: {
    userInfo: function () {
      this.$nextTick(function(){
        this.useqrcode();
      });
    }
  },
  methods: {
    getUserInfoImp() {
      getImpInfo().then(response => {
        this.userInfo = response.data
        this.showMkey = response.data.mKey

        let txt = '';
        for (var i = 0; i < response.data.mKey.length; i++) {
          txt += '*';
        }
        this.userInfo.mKey = txt
      }).catch(error => {
        console.log('用户信息获取失败: '+error)
      })
    },
    lookKey() {
      this.userInfo.mKey = this.showMkey
      this.isShowCopy = true
    },
    copySuccess() {
      this.$message({
        message: '复制成功',
        type: 'success'
      });
    },
    copyError() {
      this.$message.error('复制失败, 请重试');
    },
    updateGoogleSwitch() {   //开启关闭谷歌
      updateGoogleStatus(this.userInfo.googleStatus).then(response => {
        // console.log(this.userInfo.googleStatus)
        if(this.userInfo.googleStatus) {
          this.userInfo.googleCode = response.data.code
          this.userInfo.googleSecret = response.data.secret
        }
        this.useqrcode()
      }).catch(error => {
        console.log(error)
      })
    },
    useqrcode() {   //生成二维码
      if(this.userInfo.googleStatus) {
        this.visibleGoogle = true;

        this.$nextTick(() => {
          new QRCode('qrcode', {
            width: 120,
            height: 120,
            text: this.userInfo.googleSecret // 二维码内容
          })
        })
      }else {
        this.visibleGoogle = false;
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.personal-main {
  padding: 15px;

  .item {
    margin-bottom: 18px;
    font-size: 14px;
  }

  .item b {
    display: inline-block;
    width: 80px;
    text-align: right;
    /*border: 1px solid red;*/
  }

  .item .txt1 {
    margin-left: 10px;
  }
}
</style>
