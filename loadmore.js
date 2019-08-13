import Vue from 'vue'

// 增加下拉加载指令
Vue.directive('loadmore', {
  bind(el, binding) {
    const t = 20 // 下拉到底部10px
    let loadingStatus = true
    let down = true
    let oldscroll = 0
    const selectWrap = el.querySelector('.el-table__body-wrapper')
    selectWrap.addEventListener('scroll', async function() {
      const scrollDistance =
        this.scrollHeight - this.scrollTop - this.clientHeight
      // 向下滚动判断
      this.scrollTop > oldscroll ? (down = true) : (down = false)

      oldscroll = this.scrollTop
      if (scrollDistance < t && loadingStatus && down) {
        loadingStatus = false
        await binding.value()
        loadingStatus = true
      }
    })
  },
  inserted() {},
  update() {},
  componentUpdated() {},
  unbind() {}
})
