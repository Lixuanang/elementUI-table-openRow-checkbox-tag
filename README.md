# elementUI-table-openRow-checkbox-tag

## 需求

提交勾选调度的 ui、调度所在车队 id 及 uid

## 具体需求

- 表格为车队列表，每个车队下有调度(角色)若干
- 表格筛选/分页(后台做的时间戳分页,用的加载更多)
- 每行车队信息可展开,如车队下有调度,显示调度姓名及手机号
- 调度可勾选/取消勾选，(因为有分页，所以勾选的调度在表格上方显示)
- 筛选/加载更多后，列表中勾选的调度要求依然显示勾选状态

## 表格数据结构

| 参数名 | 必选 |  类型  | 长度 | 描述               |
| :----: | :--: | :----: | :--: | ------------------ |
|   a    |  是  | String |  24  | 货源 ID            |
|   b    |  是  | String |  24  | 车队名称           |
|   c    |  是  | String |  24  | 联系人姓名         |
|   d    |  是  | String |  24  | 联系人手机号       |
|   e    |  是  |  int   |  24  | 询价状态 0 否 1 是 |
|   f    |  是  |  int   |  24  | 派单状态 0 否 1 是 |
|   z    |  是  |  long  |  24  | 时间               |

| 父元素   | 参数名        | 必选 | 类型   |  长度   | 描述                                    |
| -------- | :------------ | :--: | :----- | :-----: | --------------------------------------- |
|          | code          |  是  | int    |    4    | 0 成功                                  |
|          | pagesize      |  是  | int    |    4    | 页码数                                  |
|          | data          |  是  | array  | [0..20] | 车队列                                  |
| data     | fleet_id      |  是  | string |   24    | 车队 id                                 |
| data     | user_id       |  是  | int    |    4    | 车队 uid                                |
| data     | fleet_name    |  是  | string |   64    | 车队全称                                |
| data     | contact       |  是  | string |   64    | 联系人                                  |
| data     | contact_phone |  是  | long   |    8    | 联系方式                                |
| data     | status        |  是  | int    |    4    | 0 待审核 1 审核通过 2 审核驳回-1 已删除 |
| data     | createTime    |  是  | long   |    4    | 创建时间                                |
| data     | lst           |  是  | array  |    4    | 车队调度列表                            |
| data.lst | id            |  是  | string |    4    | 调度 id                                 |
| data.lst | uid           |  是  | string |    4    | 调度 uid                                |
| data.lst | name          |  是  | string |    4    | 调度姓名                                |
| data.lst | mobile        |  是  | string |    4    | 调度手机号                              |
| data.lst | xj_status     |  是  | int    |    4    | 询价状态 0 否 1 是                      |
| data.lst | pd_status     |  是  | int    |    4    | 派单状态 0 否 1 是                      |

## 主要实现(有待改善)

`el-checkbox-group`:v-model 监听所有*选中的调度*

`@expand-change(row,expandedRows)`:表格行展开/关闭触发的事件

- row:当前操作行
- expandedRows:所有展开行

在展开/关闭表格行时，循环选中调度，判断当前行是否为选中调度，**是则勾选，否则取消**。
即判断选中所有调度的 uid 和当前行调度的 uid 是否相等，相等即存在。

## 演示

![](https://cdn.nlark.com/yuque/0/2019/gif/378417/1565694432353-assets/web-upload/489fe9d0-4b02-42a5-98be-cb76d3e27a52.gif '演示')
