pragma solidity ^0.4.25;

/*
* Version 0.1
*/

library SafeMath {
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    return _a / _b;
  }

  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
    return c;
  }
} // End of SafeMath library


contract Factory {

	uint256 public version; // Version of the Factory contract

    event FreerollLog (
        address indexed _poster,
        string _description,
        uint256 _value,
        bool _charity,
        uint256 _category,
        string _location,
        uint256 _duration,
        address _freeroll_addr
        );

	constructor(uint256 _version) public {
		version = _version;
	}

	// Create new freeroll
	function newFreeroll(string _descr,
        address _receiver,
        bool _charity,
        uint256 _category,
		uint256 _duration,
        string _location)
		public payable returns(address) {

		Freeroll c = (new Freeroll).value(msg.value)(msg.sender, // Deploy a new Freeroll contract (with msg.value)
            _receiver,
			_duration
            );

        emit FreerollLog( // Emit a log
            msg.sender,
            _descr,
            msg.value,
            _charity,
            _category,
            _location,
            _duration,
            c
            );

		return c; // Returns new Freeroll contract address
	}
} // End of Factory contract


contract Freeroll {

	using SafeMath for uint256;

	address public poster; // Freeroll poster
	address public receiver; // Address to receive funds if poster losses
	uint256 public end_date; // Wager deadline (unix time)

	constructor(address _poster, address _receiver, uint256 _duration) payable public {
		poster = _poster;
		receiver = _receiver;
		end_date = _duration.add(block.timestamp);
	}

	function() public payable {} // Contract can accept ETH

	// Poster completes goal
	function posterWon() public onlyPoster {
		require(block.timestamp <= end_date); // The freeroll's end_date has not passed
		require(msg.sender.send(address(this).balance)); // Refund the poster his ETH
	}

	// Poster fails -  public call to distribute funds
	function posterLost() public {
		require(block.timestamp > end_date);
		require(receiver.send((address(this).balance).sub(1))); // 100% (minus 1wei) to receiver
	}

	// Modifiers
	modifier onlyPoster {
		require(msg.sender == poster);
			_;
	}
} // End of Freeroll contract

/* Data:
- Main Net: 0x451b453E8B8450366F8d309Db8B36E76Ee17177D; Block height: 6771111;
- Ropsten Address: 0xF15CD8C7a4c7e28505519765a3470fc691D8D94E; Block height: 4449994;

Factory abi:
[
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

Freeroll Abi:
[
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
]

*/
