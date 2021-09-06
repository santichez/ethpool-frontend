$(function () {
    let connectBtn = $('#connect-metamask');
    let stakeBtn = $('#stake');
    let withdrawBtn = $('#withdraw-stake');
    let faqBtn = $('#faq');

    let walletConnectedText = $('#wallet-connected');
    let checkoutForm = $('#stake-form');

    let totalAmountDiv = $('#total-amount');
    let totalStakedDiv = $('#total-staked');
    let yourStakeDiv = $('#your-stake');
    let EthPoolContract;
    const EthPoolAddress = "0x9515B801CE5aDB098Cd65235b5874ee87e8397Cb";

    toastr.options = {
        "closeButton": true,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": true,
        "showDuration": "10000",
        "hideDuration": "10000",
        "timeOut": "10000",
        "extendedTimeOut": "10000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    window.ethereum.addListener('connect', async (response) => {
        if (parseInt(response.chainId) != 3) {
            toastr.error('Chain not supported, please select Ropsten Testnet');
        } else {
            toastr.success('Wallet successfully connected');
        }

        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let signer = provider.getSigner();
        EthPoolContract = new ethers.Contract(EthPoolAddress, EthPoolAbi, signer);

        let contractBalance = await provider.getBalance(EthPoolContract.address);
        totalAmountDiv.text(ethers.utils.formatEther(contractBalance) + ' ETH');

        let totalStaked = await EthPoolContract.totalStaked();
        totalStakedDiv.text(ethers.utils.formatEther(totalStaked) + ' ETH');

        //Fetch default account
        provider.listAccounts().then((accounts) => {
            let defaultAccount = accounts[0];

            if (defaultAccount) {
                walletConnectedText.removeClass('hide');
                connectBtn.addClass('hide');
                stakeBtn.removeClass('disabled');
                withdrawBtn.removeClass('disabled');

                EthPoolContract.balances(defaultAccount)
                    .then((yourStake) => {
                        yourStakeDiv.text(ethers.utils.formatEther(yourStake) + ' ETH');
                    }).catch((err) => {
                        toastr.error(err.message);
                    });
            }

        });
    });

    connectBtn.on('click', function () {
        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then((response) => {
                window.location.reload();
            })
            .catch((err) => {
                toastr.error(err.message);
            });
    });
    withdrawBtn.on('click', function () {
        EthPoolContract.withdrawStakeAndRewards()
            .then((res) => {
                toastr.info('Please refresh once the tx is confirmed');
            }).catch((err) => {
                toastr.error(err.message);
            });
    });
    checkoutForm.on('submit', (e) => {
        e.preventDefault();
        let amountInEther = document.getElementById("amount-to-stake").value;
        let amountInWei = ethers.utils.parseEther(amountInEther);

        EthPoolContract.stake({ value: amountInWei })
            .then((res) => {
                toastr.info('Please refresh once the tx is confirmed');
            }).catch((err) => {
                toastr.error(err.message);
            });
    });
    
    faqBtn.on('click', function () {
        toastr.info('wen moon');
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