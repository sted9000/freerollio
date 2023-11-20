# freerollio
[Freerollio.xyz](https://freerollio.xyz) is a dApp for motivation and accountability.

## Freerolls
A freeroll is a type of wager for motivation or accountability. "I will give you $10 if I don't exercise this week." is the simplest example of a freeroll. The technical term for this type of wager is a [pre-commitment device](https://en.wikipedia.org/wiki/Precommitment). Committing to something ahead of time provides a tangible motivation and limits your ability to back-out or change your mind -- both helpful for achieving your goals.

If you fail to achieve your goal, your money is donated to a charity you selected. If you achieve your goal, you get your money back. 

Freerolls are widely used in the poker community. Poker players are notoriously unmotivated by anything other than money and reputation. So freerolls are a great way to motivate them to do things they otherwise wouldn't do. For example, a poker player might make a freeroll with his friend to motivate himself to exercise more. If he fails, he has to hand over money to his friend (Errr!).

## Freerollio.xyz
Freerollio.xyz is a dApp that allows you to create and participate in freerolls. It is built on the Ethereum blockchain and uses smart contracts to manage freerolls.

### Usage
Currently, you need to have a metamask wallet -- a browser extension. You can participate with real ether or with test ether on the Goerli Testnet. 

### Creating a Freeroll
1. Enter the details of your freeroll
1. Review the details of your freeroll
1. Click "Submit Freeroll"
1. Confirm the transaction in the metamask extension

### Claiming Victory in a Freeroll
1. Before the deadline of your freeroll, click the "Claim Victory" button of your freeroll
1. Confirm the transaction in metamask
1. Wait for the transaction to be mined
1. You should now have your money back

### Collecting Your Winnings as a Charity
1. Click the "Collect Winnings" button of your freeroll
2. Confirm the transaction in metamask
3. Wait for the transaction to be mined
4. You should now have your winnings

---
All interactions with a freerollio contract requires a fee -- called gas. This fee is paid to secure and run the blockchain. 

Interactions with the freerollio contract take a few seconds to be processed by the blockchain.

---
## Contracts
- [Mainnet](https://etherscan.io/address/0x451b453E8B8450366F8d309Db8B36E76Ee17177D)
- [Goerli Testnet](https://goerli.etherscan.io/address/0xf08e6Df9fE14a7482CbF78c80dc719C31fdB8D71)

## Resources
- [Web site](https://freerollio.xyz)
- [Goerli Test ETH](https://goerlifaucet.com/)
- Freeroll Factory and Freeroll contracts are in the `contracts` directory

## Todo
- [ ] Refactors with JS Framework
- [ ] Add gas price to UI element
- [ ] Revamp and add clarifying UI elements
- [ ] Make accessible (readonly) without metamask
