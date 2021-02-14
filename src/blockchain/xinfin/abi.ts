export default [
	{
		"constant": true,
		"inputs": [
			{
				"name": "ids",
				"type": "bytes32[]"
			}
		],
		"name": "getStatus",
		"outputs": [
			{
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "EXPIRED",
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
		"constant": false,
		"inputs": [
			{
				"name": "id",
				"type": "bytes32"
			},
			{
				"name": "secret",
				"type": "bytes32"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "refund",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "INVALID",
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
		"name": "REFUNDED",
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
		"name": "WITHDRAWN",
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
		"name": "ACTIVE",
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
		"constant": false,
		"inputs": [
			{
				"name": "outputAmount",
				"type": "uint256"
			},
			{
				"name": "expiration",
				"type": "uint256"
			},
			{
				"name": "hashLock",
				"type": "bytes32"
			},
			{
				"name": "receiver",
				"type": "address"
			},
			{
				"name": "outputNetwork",
				"type": "string"
			},
			{
				"name": "outputAddress",
				"type": "string"
			}
		],
		"name": "newContract",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "contracts",
		"outputs": [
			{
				"name": "inputAmount",
				"type": "uint256"
			},
			{
				"name": "outputAmount",
				"type": "uint256"
			},
			{
				"name": "expiration",
				"type": "uint256"
			},
			{
				"name": "status",
				"type": "uint256"
			},
			{
				"name": "hashLock",
				"type": "bytes32"
			},
			{
				"name": "sender",
				"type": "address"
			},
			{
				"name": "receiver",
				"type": "address"
			},
			{
				"name": "outputNetwork",
				"type": "string"
			},
			{
				"name": "outputAddress",
				"type": "string"
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
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "getSingleStatus",
		"outputs": [
			{
				"name": "result",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "id",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "secret",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "hashLock",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "Withdraw",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "id",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "hashLock",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "Refund",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "inputAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "outputAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "expiration",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "id",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "hashLock",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "receiver",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "outputNetwork",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "outputAddress",
				"type": "string"
			}
		],
		"name": "NewContract",
		"type": "event"
	}
]