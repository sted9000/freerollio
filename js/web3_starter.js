// Find connection; else throw error
window.addEventListener('load', function() {

  // First
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 === 'undefined') {

    // Throw error
    $('body').addClass('error-no-metamask-plugin').addClass('error');

  } else {
      // Use Mist/MetaMask's provider
      console.log('Web3 provider found');
      web3 = new Web3(web3.currentProvider);
  }

    // Second
    // Network check; else throw error
    web3.version.getNetwork((err, netId) => {

      switch (netId) {
        case "1":
          console.log('This is mainnet');
          $('body').addClass('error-invalid-network').addClass('error');
          break
        case "2":
          console.log('This is the deprecated Morden test network.');
          $('body').addClass('error-invalid-network').addClass('error');
          break
        case "3":
          console.log('This is the ropsten test network.');
          // Not throw error message and screen
          break
        case "4":
          console.log('This is the Rinkeby test network.');
          $('body').addClass('error-invalid-network').addClass('error');
          break
        case "42":
          console.log('This is the Kovan test network.');
          $('body').addClass('error-invalid-network').addClass('error');
          break
        default:
          console.log('This is an unknown network.');
          $('body').addClass('error-invalid-network').addClass('error');
      }

       // Third
       // User has an account
       web3.eth.getAccounts((err, acc) => {
           if (!err) {

               if (acc.length <= 0) {
                   $('body').addClass('error-no-metamask-accounts').addClass('error');
               } else {
                   web3.eth.defaultAccount = web3.eth.accounts[0];
                   console.log("Active account: " + web3.eth.defaultAccount);

                   // Fire first function
                   newSearch();
               }

         } else {
             console.error(err);
         }
     });
    });
});

// web3 opjects (factoryInstance and freerollABI)
  var factoryABI = web3.eth.contract([
	{
		"constant": false,
		"inputs": [
			{
				"name": "_first_receiver",
				"type": "address"
			},
			{
				"name": "_second_receiver",
				"type": "address"
			},
			{
				"name": "_descr",
				"type": "string"
			},
			{
				"name": "_duration",
				"type": "uint256"
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
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "communityFreerolls",
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
		"constant": true,
		"inputs": [],
		"name": "lenCommunityFreerolls",
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
		"inputs": [
			{
				"name": "_user_address",
				"type": "address"
			}
		],
		"name": "lenUserFreerolls",
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
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userFreerolls",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]);

var factoryAddress = '0xa59136ca4f152e3c896da8c9aeda07c0ef72b3d3'; // Ropstein Testnet Factory Address

var factoryInstance = factoryABI.at(factoryAddress); // Connecting Factory ABI and Address

var freerollABI = web3.eth.contract([
	{
		"constant": true,
		"inputs": [],
		"name": "first_receiver",
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
		"constant": true,
		"inputs": [],
		"name": "rebate_contstant",
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
		"name": "second_receiver",
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
		"constant": true,
		"inputs": [],
		"name": "descr",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
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
		"inputs": [
			{
				"name": "_poster",
				"type": "address"
			},
			{
				"name": "_first_receiver",
				"type": "address"
			},
			{
				"name": "_second_receiver",
				"type": "address"
			},
			{
				"name": "_descr",
				"type": "string"
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
]);
