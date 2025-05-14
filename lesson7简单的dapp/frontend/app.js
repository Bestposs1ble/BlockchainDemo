// 初始化Web3实例
let web3;

// 页面加载时自动检测MetaMask
window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        console.log('MetaMask已检测到');
        
        // 自动尝试连接（可选）
        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                updateAccount(accounts[0]);
            }
        } catch (error) {
            console.error('自动连接失败:', error);
        }
    } else {
        alert('请先安装MetaMask扩展程序');
    }
});

// 连接按钮点击事件
document.getElementById('connectButton').addEventListener('click', async () => {
    try {
        // 请求账户访问权限
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        
        // 更新界面显示
        updateAccount(accounts[0]);
        
        // 监听账户变化
        ethereum.on('accountsChanged', (newAccounts) => {
            updateAccount(newAccounts[0] || '未连接');
        });
        
        // 获取网络信息
        const chainId = await web3.eth.getChainId();
        document.getElementById('networkId').textContent = chainId;
        
    } catch (error) {
        console.error('连接失败:', error);
        alert(`连接失败: ${error.message}`);
    }
});

// 更新账户显示函数
function updateAccount(account) {
    const accountElement = document.getElementById('account');
    if (account && account !== '未连接') {
        accountElement.textContent = `${account.slice(0, 6)}...${account.slice(-4)}`;
        accountElement.style.color = '#27AE60'; // 绿色表示已连接
    } else {
        accountElement.textContent = '未连接';
        accountElement.style.color = '#EB5757'; // 红色表示未连接
    }
}