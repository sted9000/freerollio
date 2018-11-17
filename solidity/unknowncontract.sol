pragma solidity ^0.4.24;

/*
* Version 0.5 - Openfreeroll
*
* A simple contract system with no admin or backend
* Only the freeroll poster can send and receive funds
* He is incentivized to disperse funds with a 5% rebate
* The balance will show the outcome (1 wei == posterWon; 2 wei == posterLost)
* Each freeroll creator will have mapping with his freerolls in factory
*
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

	address[] public communityFreerolls; // Array of all the contracts created by the Factory
    mapping (address => address[]) public userFreerolls; // Mapping user to his contracts

	constructor() public {}

    // Number of freerollContracts created
	function lenCommunityFreerolls() public constant returns (uint256) {
		return communityFreerolls.length;
	}

    // Number of userFreerolls
    function lenUserFreerolls(address _user_address) public constant returns (uint256) {
        return userFreerolls[_user_address].length;
    }

	// Create new freeroll
	function newFreeroll(address _first_receiver,
		address _second_receiver,
		string _descr,
		uint256 _duration)
		public payable returns(address) {

		Freeroll c = (new Freeroll).value(msg.value)(msg.sender, // Deploy a new Freeroll contract (with msg.value)
			_first_receiver,
			_second_receiver,
			_descr,
			_duration);

		communityFreerolls.push(c); // Pushing address to freerollContracts array

        userFreerolls[msg.sender].push(c); // Pushing address to usersFreerolls mapping

		return c; // Returns new Freeroll contract address
	}
} // End of Factory contract


contract Freeroll {

	using SafeMath for uint256;

	address public poster; // Freeroll poster
	address public first_receiver; // First address to receive funds if poster losses
	address public second_receiver; // Second address to receive funds if poster losses. If none uses address(0)
	string public descr; // String of the wagers goal, criteria and/or results location
	uint256 public end_date; // Wager deadline (unix time). Includes grace period and network delay addition
    uint256 public rebate_contstant =  20; // Posters rebate percentage upon calling posterLost(), 5%

	constructor(address _poster,
		address _first_receiver,
		address _second_receiver,
		string _descr,
		uint256 _duration) payable public {
		poster = _poster;
		first_receiver = _first_receiver;
		second_receiver = _second_receiver;
		descr = _descr;
		end_date = _duration.add(block.timestamp.add(900)); // Adding 15mins for possible network delay
	}

	function() public payable {} // Contract can accept ETH

	// Poster completes goal and calls this function to receive his refund
	function posterWon() public onlyPoster { // Only the poster/creator can call this function
		require(block.timestamp <= end_date); // The freeroll's end_date has not passed
		require(msg.sender.send((address(this).balance).sub(1))); // Refund the poster his ETH (minus 1 wei)

	}

	// Poster fails -  A public call to distribute funds and rebate
	function posterLost() public onlyPoster {
		require(block.timestamp > end_date); // Most be after end_date
        require(msg.sender.send(address(this).balance.div(rebate_contstant))); // 5% rebate to poster
		if (second_receiver != address(0)) { // Freeroll on has one receiver
            require(second_receiver.send((address(this).balance).div(2))); // 47.5% to second_receiver
		}
		require(first_receiver.send((address(this).balance).sub(2))); // rest to first_receiver (95% or 47.5%) (minus 2 wei)
	}

	// Modifiers
	modifier onlyPoster {
		require(msg.sender == poster);
		_;
	}
} // End of Freeroll contract

