成功部署运行基于fundme合约的dapp，实现fundme合约的转账体现功能，下一步以fundme合约为基础做一些修改。

🧱 一、核心需求（从 FundMe 到 Lottery）
FundMe 功能	升级为 Lottery 后的功能
用户出资（fund）	用户支付 ETH 参与抽奖（enterLottery）
拥有者可提现（withdraw）	合约拥有者可选择随机赢家并发送奖池资金（pickWinner）
查看捐赠地址/金额等	可查看参与者名单、当前奖池金额

✍️ 二、Lottery 合约设计（基本版本）
✅ 功能列表：
enterLottery()：用户支付 ETH 加入抽奖池

getPlayers()：获取所有参与者地址

getPot()：查看奖池余额

pickWinner()：只有合约拥有者可以调用，从参与者中随机选择一个赢家，发放全部奖池资金

resetLottery()：清空状态，为下一轮做准备
