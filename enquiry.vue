<!-- 定向询价--弹框 -->

<template>
  <div id="enquiry">
    <el-row type="flex" justify="space-between">
      <el-col :span="6">
        <el-autocomplete
          v-model="options.fleet_name"
          :fetch-suggestions="getFleets"
          placeholder="请输入车队名称"
          style="width:200px"
        />
      </el-col>
      <el-col :span="6">
        <el-input v-model="options.contact" placeholder="联系人姓名/联系人手机号码" class="input-with-select" />
      </el-col>
      <el-col :span="6">
        <el-select v-model="options.xj_status" placeholder="询价状态">
          <el-option
            v-for="item in options.statusArray"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button :loading="loading.search" type="primary" style="width:100%;" @click="search">筛选</el-button>
      </el-col>
    </el-row>

    <el-row :style="tableData.length?'min-height:42px;':''">
      <el-tag
        v-for="tag in selectArray"
        :disable-transitions="true"
        :key="tag.uid"
        :closable="true"
        style="margin:10px 10px 0 0;"
        @close="closeTags(tag)"
      >{{ tag.name }}({{ tag.mobile }})</el-tag>
    </el-row>

    <el-table
      v-loading="loading.search"
      id="inner-table"
      ref="table"
      :data="tableData"
      :row-class-name="isShowIcon"
      :height="computeHight"
      border
      style="width: 100%;"
      @selection-change="handleSelectionChange"
      @expand-change="openRow"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-row type="flex" justify="start" >
            <el-checkbox-group v-model="selectArray">
              <el-checkbox
                v-for="p in props.row.lst"
                :label="p"
                :key="p.uid"
                :checked="p.checked?true:false"
                :disabled="p.xj_status===1?true:false"
                style="margin-left:10px;"
              >{{ p.name }}({{ p.mobile }})</el-checkbox>
            </el-checkbox-group>
          </el-row>
        </template>
      </el-table-column>

      <el-table-column prop="fleet_name" label="车队名称" />
      <el-table-column prop="contact" label="联系人">
        <template slot-scope="scope">{{ scope.row.contact }}({{ scope.row.contact_phone }})</template>
      </el-table-column>
      <el-table-column prop="xj_status" label="派单状态" width="100">
        <template slot-scope="scope">
          <span
            :style="scope.row.xj_status === 0 ? '' : 'color:#999;'"
          >{{ scope.row.xj_status === 0 ? '未询价' : '已询价' }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div>
      <loadMore :status.sync="loadStatus" :loading="loading.more" @loadMore="loadMore" />
    </div>

    <el-row style="display: flex;justify-content: center;">
      <el-button type="primary" @click="confirm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </el-row>
  </div>
</template>

<script>
import LoadMore from '@/components/Loadmore'
import { checkCode } from '@/utils/helper'
import { ownFleetList, batchEnquiry } from '@/api/order'
import { getFleets } from '@/api/fleet'
export default {
  props: {
    info: {
      type: Object,
      default: {}
    },
    list: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      initFinish: false,
      loadStatus: 1,
      selection: [],
      selectArray: [],
      options: {
        fleet_name: '', // 车队id
        fleetArray: [],
        contact: '', // 姓名/手机号
        contact_phone: '',
        xj_status: '', // 询价状态
        statusArray: [
          { label: '全部', value: '' },
          { label: '已询价', value: 1 },
          { label: '未询价', value: 0 }
        ]
      },
      loading: {
        search: false,
        more: false
      },
      tableData: []
    }
  },
  components: { LoadMore },
  computed: {
    computeHight() {
      let height = '529px'
      if (this.initFinish) {
        this.tableData.length ? height = '529px' : height = '100px'
      }
      return height
    }
  },
  watch: {
    selectArray(val) {
      this.tableData.map(function(i) {
        i.lst.map(function(j) {
          val.map(function(k) {
            if (j.uid === k.uid) {
              k.fleet_id = i.fleet_id
              k.user_id = i.user_id
            }
          })
        })
      })
    }
  },
  methods: {
    isShowIcon(row, index) {
      if (row.row.lst.length > 0) { return '' } else { return 'hiderow' }
    },
    handleSelectionChange(array) {
      this.selectArray = array
    },
    // 确定
    async confirm() {
      if (this.selectArray.length === 0) {
        return self.$message.error('请选择小五')
      }
      const idArray = []
      this.selectArray.map(function(item) {
        idArray.push({
          fleet_id: item.fleet_id,
          user_id: item.user_id,
          uid: item.uid
        })
      })
      const sourceId = this.info.id
      const params = {
        sourceId,
        idArray
      }
      const result = await batchEnquiry(params)
      if (result.code === 0) {
        this.$message.success('操作成功')
        this.cancel()
      } else {
        checkCode(result)
      }
    },
    cancel() {
      this.$emit('enquiryDialog', false)
    },

    async search() {
      const params = {
        sourceId: this.info.id,
        fleet_name: this.options.fleet_name,
        contact: this.options.contact,
        contact_phone: this.options.contact,
        xj_status: this.options.xj_status,
        createTime: 0
      }
      const result = await ownFleetList(params)
      if (result.code === 0) {
        this.tableData = result.data
        this.loadStatus = 1
      } else {
        checkCode(result)
      }
    },
    // 获取车队资料列表
    getFleets(query, cb) {
      const params = {
        page: 1,
        fleet_name: query
      }
      getFleets(params).then(res => {
        if (!res.errors) {
          this.options.fleetArray = res.data.map(function(item) {
            return {
              value: item.fleet_name
              // fleet_name: item.fleet_name,
              // fleet_id: item.fleet_id
            }
          })
          cb(this.options.fleetArray)
        }
      })
    },
    // 关闭标签
    closeTags(row) {
      const self = this
      const newSelectArray = this.selectArray
      this.selectArray.map(function(item, index) {
        if (row.uid === item.uid) {
          newSelectArray.splice(index, 1)
        }
      })
      this.selectArray = newSelectArray
    },
    select(selection, row) {
      const selected = selection.length && selection.indexOf(row) !== -1
      // 选中
      if (selected) {
        const flag = this.selectArray.some(function(i) {
          return i.uid === row.uid
        })
        if (!flag) {
          this.selectArray.push(row)
        }
      } else {
        // 取消
        const index = this.selectArray.indexOf(row)
        this.selectArray.splice(index, 1)
      }
    },
    // 加载更多
    async loadMore() {
      const params = {
        sourceId: this.info.id,
        fleet_name: this.options.fleet_name,
        contact: this.options.contact,
        contact_phone: this.options.contact,
        xj_status: this.options.xj_status,
        createTime: this.tableData.length
          ? this.tableData[this.tableData.length - 1].createTime
          : 0
      }
      this.ownFleetList(params)
        .then(res => {
          this.loadStatus = res.length ? 1 : 2
        })
        .finally(() => { })
    },
    // 展开行
    openRow(row, expandedRows) {
      const self = this
      let flag = false
      const res = expandedRows.map(function(item1) {
        item1.lst.map(function(item2) {
          item2.checked = false
          row.lst.map(function(item3) {
            if (item2.uid === item3.uid) {
              flag = true
            }
          })
        })
      })
      // 展开
      if (flag) {
        self.selectArray.map(function(item2, index2) {
          item2.checked = true
          row.lst.map(function(item1) {
            if (item2.uid === item1.uid) {
              self.selectArray.splice(index2, 1)
              item1.checked = true
            }
          })
        })
      }
    },
    async ownFleetList(params) {
      const self = this

      this.loading.more = true
      return ownFleetList(params).then(result => {
        if (result.data.length) {
          this.tableData.push.apply(this.tableData, result.data)
        } else {
          checkCode(result)
        }
        return result.data
      }).finally(() => {
        this.loading.more = false
      })
    },
    // 初始化
    init() {
      this.tableData = this.list
      this.initFinish = true
    }
  },
  mounted() {
    this.init()
  }
}
</script>

<style  lang="scss">
#enquiry {
  .get-load-btn {
    margin-left: 0;
  }
  .hiderow .el-table__expand-icon {
    // visibility: hidden;
    display: none;
  }
  #inner-table {
    margin-top: 10px;
    .el-table__expanded-cell {
      padding: 10px 0 !important;
    }
    .el-table__header-wrapper {
      .el-checkbox__input {
        display: none;
      }
    }
  }
}
</style>
