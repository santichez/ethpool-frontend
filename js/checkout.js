$(function () {
    let connectBtn = $('#connect-metamask');
    let stakeBtn = $('#stake');
    let withdrawBtn = $('#withdraw-stake');
    let walletConnectedText = $('#wallet-connected');


    let checkoutForm = $('#checkout');
    let totalAmountDiv = $('#total-amount');
    let totalStakedDiv = $('#total-staked');
    let yourStakeDiv = $('#your-stake');
    const EthPoolAddress = "0x9515B801CE5aDB098Cd65235b5874ee87e8397Cb";
    const EthPoolAbi = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalStaked",
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
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "name": "balances",
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
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "stake",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "depositRewards",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "withdrawStakeAndRewards",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    let defaultAccount, provider, signer, chainId, BNBContract;

    window.ethereum.addListener('connect', async (response) => {

        chainId = parseInt(response.chainId);

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        BNBContract = new ethers.Contract(EthPoolAddress, EthPoolAbi, signer);

        const balance = await provider.getBalance(BNBContract.address);
        totalAmountDiv.text(ethers.utils.formatEther(balance) + ' ETH');

        const totalStaked = await BNBContract.totalStaked();
        totalStakedDiv.text(ethers.utils.formatEther(totalStaked) + ' ETH');

        // const yourStake = await ('0x00bE57E4ec695d077E63c5EB84187a7E70169279');
        //     yourStakeDiv.text(ethers.utils.formatEther(yourStake) + ' ETH');

        //Fetch default account
        provider.listAccounts().then((accounts) => {
            defaultAccount = accounts[0];

            if(defaultAccount) {
                walletConnectedText.removeClass('hide');
                withdrawBtn.removeClass('hide');
                connectBtn.addClass('hide').removeClass('col-md-6').removeClass('col-lg-6');
                stakeBtn.removeClass('disabled');
                withdrawBtn.removeClass('disabled');

                BNBContract.balances(defaultAccount)
                    .then((yourStake) =>{
                        yourStakeDiv.text(ethers.utils.formatEther(yourStake) + ' ETH');
                    }).catch((err) => {
                    console.log(err);
                });
            }
            
        });
    });

    const connectMetaMask = async () => {
        window.ethereum.request({method: 'eth_requestAccounts'})
            .then((response) => {
                alert('Wallet connected successfully!');
                window.location.reload();
            })
            .catch((error) => {
                alert('An error occurred, please check the console for details');
                console.log(error);
            });
    };

    const checkoutPayment = () => {

        let amountInEther = document.getElementById("amount-to-stake").value;
        let amountInWei = ethers.utils.parseEther(amountInEther);

        BNBContract.stake({
            value: amountInWei
          })
            .then((res) =>{
                console.log(res);
            }).catch((err) => {
            console.log(err);
        });

        return false;
    };

    const withdrawStake = () => {
        BNBContract.withdrawStakeAndRewards()
            .then((res) =>{
                alert('Total of ' + res + ' ETH deposited to your wallet');
            }).catch((err) => {
            console.log(err);
        });

        return false;
    };

    connectBtn.on('click', connectMetaMask);
    withdrawBtn.on('click', withdrawStake);

    checkoutForm.on('submit',(e)=>{
        e.preventDefault();
        checkoutPayment();
    });

    window.ethereum.on('accountsChanged', () => {
        window.location.reload();
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });

    window.ethereum.on('disconnect', () => {
        window.location.reload();
    });
});