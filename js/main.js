import {ethers} from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

/*** Connect to web3 provider ***/
let signer = null;
let provider;
const factoryAbi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_descr",
                "type": "string"
            },
            {
                "name": "_receiver",
                "type": "address"
            },
            {
                "name": "_charity",
                "type": "bool"
            },
            {
                "name": "_category",
                "type": "uint256"
            },
            {
                "name": "_duration",
                "type": "uint256"
            },
            {
                "name": "_location",
                "type": "string"
            }
        ],
        "name": "newFreeroll",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "version",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_version",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_poster",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_description",
                "type": "string"
            },
            {
                "indexed": false,
                "name": "_value",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "_charity",
                "type": "bool"
            },
            {
                "indexed": false,
                "name": "_category",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "_location",
                "type": "string"
            },
            {
                "indexed": false,
                "name": "_duration",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "_freeroll_addr",
                "type": "address"
            }
        ],
        "name": "FreerollLog",
        "type": "event"
    }
]
const freerollAbi = [
    {
        "constant": true,
        "inputs": [],
        "name": "end_date",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "poster",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "posterWon",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "posterLost",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "receiver",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_poster",
                "type": "address"
            },
            {
                "name": "_receiver",
                "type": "address"
            },
            {
                "name": "_duration",
                "type": "uint256"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    }
];
const start_block = 6771111; // block of factory deployment
let factoryAddress;

// Check that the browser supports window.ethereum
if (window.ethereum == null) {
    // alert to install metamask
    alert("Please install MetaMask to use this dApp!");
} else {
    // set provider and signer
    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner();

    // setNetworkValues
    let network = await provider.getNetwork();
    await setNetworkValues(network.chainId);
}

window.ethereum.on("chainChanged", async (chainId) => {
    // update the provider and signer
    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner();
    // setNetworkValues
    await setNetworkValues(chainId);
});


async function setNetworkValues(chainId) {



    // set address, network, and balance
    let address = await signer.getAddress();
    document.getElementById("signer").innerHTML = address.slice(0, 6) + '...' + address.slice(-4);
    let network = await provider.getNetwork();
    document.getElementById("network").innerHTML = network.name;
    // let balance = await signer.getBalance();
    // document.getElementById("balance").innerHTML = ethers.formatEther(balance);

    // set factory address
    switch (chainId) {
        case '0x1':
        case 1n:
            name = 'Mainnet';
            factoryAddress = '0x451b453E8B8450366F8d309Db8B36E76Ee17177D';
            break;
        case '0x5':
        case 5n:
            name = 'Goerli';
            factoryAddress = '0xf08e6Df9fE14a7482CbF78c80dc719C31fdB8D71';
            break;
        default:
            name = 'Unknown';
    }

    // update events elements
    document.getElementById("query-results").innerHTML = '';
    const contract = new ethers.Contract(factoryAddress, factoryAbi, provider);
    let end_block = await provider.getBlockNumber();
    let events = await contract.queryFilter("FreerollLog", start_block, end_block);
    for (let i = 0; i < events.length; i++) {
        // create div for each event
        let div = document.createElement("div");
        div.className = "freeroll";
        div.id = events[i].args._freeroll_addr;
        // create h2 for each event
        let title = document.createElement("div");
        title.className = "freeroll-title";
        title.innerHTML = events[i].args._description;
        div.appendChild(title);

        // create p for each event with the amount + ether symbol + the date of the event
        let details = document.createElement("p");
        details.className = "freeroll-details";

        let amount = document.createElement("span");
        amount.className = "freeroll-detail-item";
        amount.innerHTML = ethers.formatEther(events[i].args._value) + ' ETH posted by ';

        let poster = document.createElement("a");
        poster.className = "freeroll-detail-item";
        poster.href = 'https://goerli.etherscan.io/address/' + events[i].args._poster;
        poster.innerHTML = events[i].args._poster.slice(0, 6) + '...' + events[i].args._poster.slice(-4);

        let block_number_text = document.createElement("span");
        block_number_text.className = "freeroll-detail-item";
        block_number_text.innerHTML = ' on block #: ';

        let block_number = document.createElement("a");
        block_number.className = "freeroll-detail-item";
        block_number.href = 'https://goerli.etherscan.io/block/' + events[i].blockNumber;
        block_number.innerHTML = events[i].blockNumber;


        details.appendChild(amount);
        details.appendChild(poster);
        details.appendChild(block_number_text);
        details.appendChild(block_number);
        div.appendChild(details);

        // if the user is the poster, add a "Claim" button
        let isPoster = events[i].args._poster === address;
        if (isPoster) {
            let claim = document.createElement("button");
            claim.className = "second-button";
            claim.innerHTML = "Claim";
            claim.onclick = claimFreeroll;
            div.appendChild(claim);
        }
        // create "See More" button
        let button = document.createElement("button");
        button.className = isPoster ? "first-button" : "second-button";
        button.innerHTML = "Details";
        button.onclick = showDetails;
        div.appendChild(button);

        // add to page
        document.getElementById("query-results").appendChild(div);
    }
}

/*** Listeners ***/
// input-description
document.getElementById("input-description").addEventListener("input", function () {
    // if input is empty, hide error message
    if (this.value.length === 0) {
        document.getElementById("description-error").style.display = "none";
        document.getElementById("description-valid").style.display = "none";
    } else if (this.value.length > 140) {
        document.getElementById("description-error").style.display = "inline";
        document.getElementById("description-valid").style.display = "none";
    } else {
        document.getElementById("description-error").style.display = "none";
        document.getElementById("description-valid").style.display = "inline";
    }
});

// input-receiver
document.getElementById("input-receiver").addEventListener("input", function () {
    // check if input is valid address
    if (this.value.length === 0) {
        // if empty, hide error and valid message
        document.getElementById("receiver-error").style.display = "none";
        document.getElementById("receiver-valid").style.display = "none";
    } else if (ethers.isAddress(this.value)) {
        // if valid, hide error, and show valid message
        document.getElementById("receiver-error").style.display = "none";
        document.getElementById("receiver-valid").style.display = "inline";
    } else {
        // if invalid, display error message, hide valid message
        document.getElementById("receiver-error").style.display = "inline";
        document.getElementById("receiver-valid").style.display = "none";
    }
});

// input-amount
document.getElementById("input-amount").addEventListener("input", function () {
    // check if input is a number between 0.01 and 10
    if (this.value === "0" || this.value.length === 0) {
        // if empty, hide error and valid message
        document.getElementById("amount-error").style.display = "none";
        document.getElementById("amount-valid").style.display = "none";
    } else if (this.value < 0.01 || this.value > 10 || isNaN(this.value)) {
        // if invalid, display error message, hide valid message
        document.getElementById("amount-error").style.display = "inline";
        document.getElementById("amount-valid").style.display = "none";
    } else {
        // if valid, hide error, and show valid message
        document.getElementById("amount-error").style.display = "none";
        document.getElementById("amount-valid").style.display = "inline";
    }
});

// input-duration
document.getElementById("input-duration").addEventListener("input", function () {
    // check if the input is a number between 1 and 365
    if (this.value === "0" || this.value.length === 0) {
        // if empty, hide error and valid message
        document.getElementById("duration-error").style.display = "none";
        document.getElementById("duration-valid").style.display = "none";
    } else if (this.value < 1 || this.value > 365 || isNaN(this.value)) {
        // if invalid, display error message, hide valid message
        document.getElementById("duration-error").style.display = "inline";
        document.getElementById("duration-valid").style.display = "none";
    } else {
        // if valid, hide error, and show valid message
        document.getElementById("duration-error").style.display = "none";
        document.getElementById("duration-valid").style.display = "inline";
    }
});

// review-button
document.getElementById("review-button").addEventListener("click", async function () {

    // get values from inputs
    let descr = document.getElementById("input-description").value;
    let receiver = document.getElementById("input-receiver").value;
    let charity = false;
    let category = 0;
    let duration = document.getElementById("input-duration").value;
    let location = '';
    let amount = document.getElementById("input-amount").value;

    // check if inputs are valid
    if (descr.length === 0) {
        alert("Please enter a description.");
        return;
    } else if (descr.length > 140) {
        alert("Please enter a description less than 140 characters.");
        return;
    } else if (!ethers.isAddress(receiver)) {
        alert("Please enter a valid receiver address.");
        return;
    } else if (amount === "0" || amount.length === 0) {
        alert("Please enter a valid amount.");
        return;
    } else if (duration === "0" || duration.length === 0) {
        alert("Please enter a valid duration.");
        return;
    }

    // format inputs
    amount = ethers.parseEther(amount);
    console.log('amount: ', amount)
    duration = parseInt(duration) * 86400;

    // get eth price
    let response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    let data = await response.json();
    let ethPrice = data.ethereum.usd;

    // estimate gas
    // todo: looks like the ethers estimateGas function is returning an amount that doesn't makes sense (too low)
    // const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);
    // let gasEstimate = await factory.newFreeroll.estimateGas(descr, receiver, charity, category, duration, location, {value: amount});
    // let gasEstimateGwei = ethers.formatUnits(gasEstimate, 'gwei');
    // console.log('gas estimate gwei: ', gasEstimateGwei);
    let gasEstimateGwei = 100;

    // gasEstimate in gwei parsed to wei
    let gasEstimateWei = ethers.parseUnits(gasEstimateGwei.toString(), 'gwei');

    // gasEstimateEth
    let gasEstimateEth = ethers.formatEther(gasEstimateWei);

    // gasEstimate eth to usd
    let gasEstimateUsd = gasEstimateEth * ethPrice;

    // total in wei
    let totalWei = amount + gasEstimateWei;

    // total in eth
    let totalEth = ethers.formatEther(totalWei);

    // total cost in usd
    let totalUsd = totalEth * ethPrice;

    // end date of the freeroll in unix time
    let endDate = Math.floor(Date.now() / 1000) + duration;

    // update dom
    document.getElementById("input-description").disabled = true;  // disable inputs
    document.getElementById("input-receiver").disabled = true;
    document.getElementById("input-amount").disabled = true;
    document.getElementById("input-duration").disabled = true;
    document.getElementById("review-button").style.display = 'none';  // hide button
    document.getElementById("gas-estimate-gwei").innerHTML = gasEstimateGwei.toString();  // populate gas-estimate
    document.getElementById("gas-estimate-usd").innerHTML = gasEstimateUsd.toFixed(2);  // populate gas-estimate-usd
    document.getElementById("total-cost-eth").innerHTML = totalEth.toString();  // populate total-cost
    document.getElementById("total-cost-usd").innerHTML = totalUsd.toFixed(2);  // populate total-cost-usd
    // end date in format of 1/1/2021 12:00 AM (do not include seconds)
    document.getElementById("end-date").innerHTML = new Date(endDate * 1000).toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    }) + ' ' + new Date(endDate * 1000).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
    document.getElementById("review-container").style.display = 'block';  // show review-container

});

// clear-review button
document.getElementById("clear-review").addEventListener("click", function () {
    document.getElementById("input-description").disabled = false;  // enable inputs
    document.getElementById("input-receiver").disabled = false;
    document.getElementById("input-amount").disabled = false;
    document.getElementById("input-duration").disabled = false;
    document.getElementById("review-button").style.display = 'block';  // show button
    document.getElementById("review-container").style.display = 'none';  // hide review-container
});

// submit-freeroll button
document.getElementById("submit-freeroll").addEventListener("click", async function () {
    // get values from inputs
    let descr = document.getElementById("input-description").value;
    let receiver = document.getElementById("input-receiver").value;
    let charity = false;
    let category = 0;
    let duration = document.getElementById("input-duration").value;
    let location = '';
    let amount = document.getElementById("input-amount").value;

    // check if inputs are valid
    if (descr.length === 0) {
        alert("Please enter a description.");
        return;
    } else if (descr.length > 140) {
        alert("Please enter a description less than 140 characters.");
        return;
    } else if (!ethers.isAddress(receiver)) {
        alert("Please enter a valid receiver address.");
        return;
    } else if (amount === "0" || amount.length === 0) {
        alert("Please enter a valid amount.");
        return;
    }

    // format inputs
    amount = ethers.parseEther(amount);
    console.log('amount: ', amount)
    duration = parseInt(duration) * 86400;
    // create a transaction request
    const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);
    let tx = {
        to: factoryAddress,
        value: amount,
        // gasLimit: gasEstimateWei,
        // gasPrice: ethers.parseUnits('100', 'gwei'),
        data: factory.interface.encodeFunctionData("newFreeroll", [descr, receiver, charity, category, duration, location])
    };
    // send the transaction
    let txResponse = await signer.sendTransaction(tx);
    console.log('txResponse: ', txResponse);

});

// details button
function showDetails() {
    // take to etherscan goerli block explorer
    window.open('https://goerli.etherscan.io/address/' + this.parentNode.id);
}

// claim button
async function claimFreeroll() {
    // get freeroll contract
    const freeroll = new ethers.Contract(this.parentNode.id, freerollAbi, signer);
    // send transaction to claim
    let txResponse = await freeroll.posterWon();
    console.log('txResponse: ', txResponse);
}

// Deploy a factory contract
// const factoryBytecode = '608060405234801561001057600080fd5b506040516020806108ee8339810180604052810190808051906020019092919050505080600081905550506108a48061004a6000396000f30060806040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631f1b88eb1461005157806354fd4d5014610173575b600080fd5b610131600480360381019080803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035151590602001909291908035906020019092919080359060200190929190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919291929050505061019e565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561017f57600080fd5b506101886103c3565b6040518082815260200191505060405180910390f35b600080343388866101ad6103c9565b808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200193505050506040518091039082f080158015610238573d6000803e3d6000fd5b50905090503373ffffffffffffffffffffffffffffffffffffffff167fe16428eac31f206693d493c365b22c76050fd554e8ca4c2dda8ffa3856d494d489348989888a88604051808060200188815260200187151515158152602001868152602001806020018581526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183810383528a818151815260200191508051906020019080838360005b8381101561030e5780820151818401526020810190506102f3565b50505050905090810190601f16801561033b5780820380516001836020036101000a031916815260200191505b50838103825286818151815260200191508051906020019080838360005b83811015610374578082015181840152602081019050610359565b50505050905090810190601f1680156103a15780820380516001836020036101000a031916815260200191505b50995050505050505050505060405180910390a2809150509695505050505050565b60005481565b60405161049f806103da833901905600608060405260405160608061049f833981018060405281019080805190602001909291908051906020019092919080519060200190929190505050826000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506100db42826100e964010000000002610343179091906401000000009004565b600281905550505050610105565b600081830190508281101515156100fc57fe5b80905092915050565b61038b806101146000396000f30060806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806333bbae931461006f578063809597211461009a57806399d26f3e146100f1578063cdfa750314610108578063f7260d3e1461011f575b005b34801561007b57600080fd5b50610084610176565b6040518082815260200191505060405180910390f35b3480156100a657600080fd5b506100af61017c565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156100fd57600080fd5b506101066101a1565b005b34801561011457600080fd5b5061011d610266565b005b34801561012b57600080fd5b50610134610304565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b60025481565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156101fc57600080fd5b600254421115151561020d57600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc3073ffffffffffffffffffffffffffffffffffffffff16319081150290604051600060405180830381858888f19350505050151561026457600080fd5b565b6002544211151561027657600080fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc6102dd60013073ffffffffffffffffffffffffffffffffffffffff163161032a90919063ffffffff16565b9081150290604051600060405180830381858888f19350505050151561030257600080fd5b565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600082821115151561033857fe5b818303905092915050565b6000818301905082811015151561035657fe5b809050929150505600a165627a7a72305820bcee687fd8c65f6fe499dd91bb93d9bab7c6a72a595251a89ef50eb27b2620f10029a165627a7a72305820bf685bad577269853aeeba050c142ea0b17222793eb14a70beca5d8daa8b00960029';
// const factory = new ethers.ContractFactory(factoryAbi, factoryBytecode, signer);
// const factoryContract = await factory.deploy(1);
// console.log('factoryContract: ', factoryContract);
