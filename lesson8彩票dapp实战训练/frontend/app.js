const contractAddress = "0xdB8c2a2BcdD9e6701A04fd27C10ea3d5f3E2a9e1"; // 部署后替换
const abi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "priceFeed",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "FundMe__NotOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MINIMUM_USD",
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
      "name": "cheaperWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fund",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "fundingAddress",
          "type": "address"
        }
      ],
      "name": "getAddressToAmountFunded",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getFunder",
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
      "inputs": [],
      "name": "getPriceFeed",
      "outputs": [
        {
          "internalType": "contract AggregatorV3Interface",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVersion",
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
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  let provider, signer, contract;

  const connectBtn = document.getElementById("connectButton");
  const fundBtn = document.getElementById("fundButton");
  const withdrawBtn = document.getElementById("withdrawButton");
  const ethInput = document.getElementById("ethAmount");
  const statusDiv = document.getElementById("status");
  
  connectBtn.onclick = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
  
        const userAddress = await signer.getAddress();
        const userBalance = await provider.getBalance(userAddress);
        const contractBalance = await provider.getBalance(contractAddress);
  
        statusDiv.innerHTML =
          `✅ Connected: ${userAddress}<br>` +
          `💰 Your balance: ${ethers.utils.formatEther(userBalance)} ETH<br>` +
          `📦 Contract balance: ${ethers.utils.formatEther(contractBalance)} ETH`;
      } catch (error) {
        statusDiv.textContent = "❌ Connection failed: " + error.message;
      }
    } else {
      alert("Please install MetaMask");
    }
  };
  
  fundBtn.onclick = async () => {
    if (!contract) return alert("Please connect your wallet first.");
    const ethAmount = ethInput.value;
    if (!ethAmount || Number(ethAmount) <= 0) return alert("Enter a valid ETH amount");
  
    try {
      const tx = await contract.fund({ value: ethers.utils.parseEther(ethAmount) });
      statusDiv.textContent = "⏳ Funding...";
      await tx.wait();
      statusDiv.textContent = "✅ Funded successfully!";
    } catch (err) {
      statusDiv.textContent = "❌ Fund failed: " + (err.data?.message || err.message);
    }
  };
  
  withdrawBtn.onclick = async () => {
    if (!contract) return alert("Please connect your wallet first.");
    try {
      const tx = await contract.withdraw();
      statusDiv.textContent = "⏳ Withdrawing...";
      await tx.wait();
      statusDiv.textContent = "✅ Withdrawal successful!";
    } catch (err) {
      statusDiv.textContent = "❌ Withdraw failed: " + (err.data?.message || err.message);
    }
  };
