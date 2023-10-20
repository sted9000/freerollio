import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
let signer = null;
let provider;

// Check that the browser supports window.ethereum
if (window.ethereum == null) {

    // If MetaMask is not installed, we use the default provider,
    // which is backed by a variety of third-party services (such
    // as INFURA). They do not have private keys installed so are
    // only have read-only access
    console.log("MetaMask not installed; using read-only defaults")
    provider = ethers.getDefaultProvider()
} else {
    // Connect to the MetaMask EIP-1193 object. This is a standard
    // protocol that allows Ethers access to make all read-only
    // requests through MetaMask.
    provider = new ethers.BrowserProvider(window.ethereum)

    // It also provides an opportunity to request access to write
    // operations, which will be performed by the private key
    // that MetaMask manages for the user.
    signer = await provider.getSigner();

    // Update the dom with the signer's address
    document.getElementById("signer").innerHTML = await signer.getAddress();
}

// add listener to input-description
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

// add event listener to input-receiver
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

// add event listener to input-amount
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

// add event listener to input-duration
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

// add event listener to estimate-gas-button
document.getElementById("estimate-gas-button").addEventListener("click", async function () {

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

    // update dom
    document.getElementById("input-description").disabled = true;  // disable inputs
    document.getElementById("input-receiver").disabled = true;
    document.getElementById("input-amount").disabled = true;
    document.getElementById("input-duration").disabled = true;
    document.getElementById("estimate-gas-button").style.display = 'none';  // hide button
    document.getElementById("gas-estimate-gwei").innerHTML = gasEstimateGwei.toString();  // populate gas-estimate
    document.getElementById("gas-estimate-usd").innerHTML = gasEstimateUsd.toFixed(2);  // populate gas-estimate-usd
    document.getElementById("total-cost-eth").innerHTML = totalEth.toString();  // populate total-cost
    document.getElementById("total-cost-usd").innerHTML = totalUsd.toFixed(2);  // populate total-cost-usd
    document.getElementById("review-container").style.display = 'block';  // show review-container

});

// listener for double-check checkbox
document.getElementById("double-check").addEventListener("change", function () {
    if (this.checked) {
        document.getElementById("submit-freeroll").disabled = false;
    } else {
        document.getElementById("submit-freeroll").disabled = true;
    }
});

// listener for clear-review button
document.getElementById("clear-review").addEventListener("click", function () {
    document.getElementById("input-description").disabled = false;  // enable inputs
    document.getElementById("input-receiver").disabled = false;
    document.getElementById("input-amount").disabled = false;
    document.getElementById("input-duration").disabled = false;
    document.getElementById("double-check").checked = false;  // reset double-check checkbox
    document.getElementById("submit-freeroll").disabled = true;  // disable submit-freeroll button
    document.getElementById("estimate-gas-button").style.display = 'block';  // show button
    document.getElementById("review-container").style.display = 'none';  // hide review-container
});


// code from simple example
// await provider.send("eth_requestAccounts", []);
// const contractAddress = '0xaa22814802FE5c8A25ce22EFdACdE67e24E18a10'
// const balance = await provider.getBalance(contractAddress)
// console.log('balance of contract:', ethers.formatEther(balance))
// end code from simple example

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
const factoryAddress = '0x451b453E8B8450366F8d309Db8B36E76Ee17177D';
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
const end_block = await provider.getBlockNumber()
const contract = new ethers.Contract(factoryAddress, factoryAbi, provider);
const events = await contract.queryFilter("FreerollLog", start_block, end_block)
// loop through events array
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
    // create "See More" button
    let button = document.createElement("button");
    button.className = "freeroll-button";
    button.innerHTML = "Details";
    div.appendChild(button);
    // add to page
    document.getElementById("query-results").appendChild(div);
}
