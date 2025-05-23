// 配置参数（部署后需要修改！）
const CONTRACT_ADDRESS = "0x5254b51C9275b894139d67E26EBED36cBe222Aab"; // 替换为你的合约地址
const TARGET_CHAIN_ID = "0x539"; // Ganache的chainId（9545的十六进制）
const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "interval",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "entranceFee",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "Raffle__RaffleNotOpen",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Raffle__SendMoreToEnterRaffle",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Raffle__TransferFailed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "RaffleEnter",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "WinnerPicked",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "enterRaffle",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getEntranceFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getInterval",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLastTimeStamp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getNumberOfPlayers",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getPlayer",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRaffleState",
      "outputs": [
        {
          "internalType": "enum Raffle.RaffleState",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRecentWinner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "manualTriggerDraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// 全局状态
let raffleContract;
let provider;
let signer;
let currentAccount;
let errorHistory = [];

// 钱包连接逻辑
async function connectWallet() {
    try {
        if (!window.ethereum) {
            showError({ message: "请安装MetaMask钱包" });
            return;
        }
        
        showLoading('正在连接钱包...');
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== TARGET_CHAIN_ID) {
            showNetworkWarning();
            return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        raffleContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        updateUI();
        setupEventListeners();
        
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading();
    }
}

// 合约交互
async function enterRaffle() {
    try {
        showLoading('等待交易确认...');
        const entranceFee = await raffleContract.getEntranceFee();
        
        const tx = await raffleContract.enterRaffle({
            value: entranceFee,
            gasLimit: 300000
        });
        
        const receipt = await tx.wait();
        if (receipt.status === 1) {
            showSuccess('✅ 参与成功！');
            loadContractData();
        }
        
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading();
    }
}

async function triggerDraw() {
    try {
        showLoading('正在提交开奖请求...');
        const tx = await raffleContract.manualTriggerDraw();
        await tx.wait();
        showSuccess('🎉 开奖请求已提交');
        loadContractData();
        
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading();
    }
}

// 数据加载
async function loadContractData() {
    try {
        const entranceFee = await raffleContract.getEntranceFee();
        const participants = await raffleContract.getNumberOfPlayers();
        const balance = await provider.getBalance(CONTRACT_ADDRESS);
        const network = await provider.getNetwork();
        const winner = await raffleContract.getRecentWinner();

        document.getElementById('entranceFee').textContent = `${ethers.utils.formatEther(entranceFee)} ETH`;
        document.getElementById('entranceFeeBtn').textContent = ethers.utils.formatEther(entranceFee);
        document.getElementById('participantsCount').textContent = participants;
        document.getElementById('contractBalance').textContent = `${ethers.utils.formatEther(balance)} ETH`;
        document.getElementById('networkStatusText').textContent = `${network.name} (${network.chainId})`;
        document.getElementById('recentWinner').textContent = 
            winner === ethers.constants.AddressZero ? '等待首次开奖...' : winner;

        // 管理员检查
        const owner = await raffleContract.getOwner();
        document.getElementById('triggerBtn').classList.toggle(
            'hidden', 
            currentAccount?.toLowerCase() !== owner.toLowerCase()
        );

    } catch (error) {
        handleError(error);
    }
}

// 错误处理
function handleError(error) {
    const errorData = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        timestamp: new Date().toISOString()
    };
    errorHistory.push(errorData);
    
    showErrorModal(
        getFriendlyMessage(error),
        errorData
    );
    console.error("完整错误:", error);
}

function getFriendlyMessage(error) {
    const errorMap = {
        4001: "您取消了交易操作",
        "ACTION_REJECTED": "用户拒绝交易签名",
        "Raffle__SendMoreToEnterRaffle": "参与金额不足，请检查费用",
        "Raffle__RaffleNotOpen": "当前无法参与，请等待开奖完成",
        "NETWORK_ERROR": "网络连接异常，请检查网络设置",
        "default": "发生未知错误，请稍后重试"
    };
    return errorMap[error.code] || errorMap[error.message] || errorMap.default;
}

function showErrorModal(message, errorData) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorStack').textContent = JSON.stringify(errorData, null, 2);
    document.getElementById('errorModal').classList.remove('hidden');
}

function showErrorDetails() {
    document.getElementById('errorModal').classList.add('hidden');
    document.getElementById('errorDetails').classList.remove('hidden');
}

function closeAllModals() {
    document.getElementById('errorModal').classList.add('hidden');
    document.getElementById('errorDetails').classList.add('hidden');
}

// UI更新
function updateUI() {
    const addressDisplay = currentAccount 
        ? `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`
        : '未连接';
    document.getElementById('userAddress').textContent = addressDisplay;
    document.getElementById('connectBtn').classList.toggle('hidden', !!currentAccount);
    document.getElementById('userInfo').classList.toggle('hidden', !currentAccount);
}

// 事件监听
function setupEventListeners() {
    window.ethereum.on('accountsChanged', ([account]) => {
        currentAccount = account;
        updateUI();
        loadContractData();
    });

    window.ethereum.on('chainChanged', (chainId) => {
        if (chainId !== TARGET_CHAIN_ID) {
            showNetworkWarning();
        } else {
            document.getElementById('networkStatus').classList.add('hidden');
            loadContractData();
        }
    });

    provider.on('block', () => {
        loadContractData();
    });

    setInterval(loadContractData, 30000);
}

// 工具函数
function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'fixed bottom-4 right-4 bg-green-100 p-4 rounded-lg animate-slide-in';
    div.innerHTML = `
        <i class="fas fa-check-circle text-green-600 mr-2"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function showNetworkWarning() {
    document.getElementById('networkStatus').classList.remove('hidden');
    document.getElementById('enterBtn').disabled = true;
}

// 初始化
window.addEventListener('load', () => {
    if (window.ethereum) {
        window.ethereum.on('chainChanged', updateNetworkStatus);
        updateNetworkStatus();
    }
});

function updateNetworkStatus() {
    const isCorrectNetwork = window.ethereum.chainId === TARGET_CHAIN_ID;
    document.getElementById('networkStatus').classList.toggle('hidden', isCorrectNetwork);
    document.getElementById('enterBtn').disabled = !isCorrectNetwork;
}
