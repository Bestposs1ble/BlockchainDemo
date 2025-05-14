// 配置项（替换为实际值）
const CONTRACT_ADDRESS = '0xf79E649f724AadC9832BFe80728a4023F1a9c62D';
const CONTRACT_ABI = [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "operation",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "num1",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "num2",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "result",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "Calculation",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_num1",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_num2",
            "type": "uint256"
          }
        ],
        "name": "add",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_num1",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_num2",
            "type": "uint256"
          }
        ],
        "name": "div",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_num1",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_num2",
            "type": "uint256"
          }
        ],
        "name": "mul",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_num1",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_num2",
            "type": "uint256"
          }
        ],
        "name": "sub",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    
  
  ];

// 系统初始化
let web3, contract, currentAccount;

async function init() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        
        // 监听历史事件
        contract.events.Calculation({fromBlock: 'latest'})
            .on('data', log => addTransaction(log))
            .on('error', console.error);

        // 自动连接
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            currentAccount = accounts[0];
            updateUI();
        }
    }
}

// 连接功能
document.getElementById('connectButton').addEventListener('click', async () => {
    try {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        currentAccount = accounts[0];
        
        // 初始化合约监听
        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        updateUI();
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', ([account]) => {
            currentAccount = account;
            updateUI();
        });
        
        // 监听网络变化
        window.ethereum.on('chainChanged', chainId => {
            document.getElementById('networkId').textContent = parseInt(chainId, 16);
        });

    } catch (error) {
        showError(`连接失败: ${error.message}`);
    }
});

// 执行合约计算
async function calculate(operation) {
    try {
        const num1 = document.getElementById('input1').value;
        const num2 = document.getElementById('input2').value;
        
        const tx = await contract.methods[operation](num1, num2)
            .send({from: currentAccount});
        
        addTransaction({
            transactionHash: tx.transactionHash,
            returnValues: {
                operation: operation.toUpperCase(),
                num1, num2,
                result: tx.events.Calculation.returnValues.result,
                timestamp: Math.floor(Date.now() / 1000)
            }
        });
        
    } catch (error) {
        showError(`操作失败: ${error.message}`);
    }
}

// 更新交易记录
function addTransaction(event) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${new Date(event.returnValues.timestamp * 1000).toLocaleString()}</td>
        <td>${event.returnValues.operation}</td>
        <td>${event.returnValues.num1}</td>
        <td>${event.returnValues.num2}</td>
        <td>${event.returnValues.result}</td>
        <td class="tx-hash" title="${event.transactionHash}">
            ${event.transactionHash.slice(0,6)}...${event.transactionHash.slice(-4)}
        </td>
    `;
    document.getElementById('txBody').prepend(row);
}

// 界面更新
function updateUI() {
    // 更新账户显示
    const accountEl = document.getElementById('accountAddress');
    if (currentAccount) {
        accountEl.textContent = `${currentAccount.slice(0,6)}...${currentAccount.slice(-4)}`;
        accountEl.title = currentAccount;
    } else {
        accountEl.textContent = '未连接';
    }
    
    // 更新网络显示
    web3.eth.getChainId().then(chainId => {
        document.getElementById('networkId').textContent = chainId;
    });
}

// 错误处理
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px;
        background: #e74c3c;
        color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    errorEl.textContent = message;
    document.body.appendChild(errorEl);
    setTimeout(() => errorEl.remove(), 3000);
}

// 启动初始化
init();
