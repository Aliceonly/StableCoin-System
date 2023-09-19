/** @type import('hardhat/config').HardhatUserConfig */
const MAINNET_RPC_URL =
  "https://eth-mainnet.g.alchemy.com/v2/wUW64gJZabnbxXjrCDHk4gTlNGztf5LR";
const GOERLI_RPC_URL =
  "https://eth-goerli.g.alchemy.com/v2/2pGuG3TbjvaNSMq4P-vlsCfU1a8ps-S5";
const PRIVATE_KEY = "61a9fae2a22f051baa6cd934a3e5ca23834797b771ed1b1db913a536cd5ce63d"
const ETHERSCAN_API_KEY = "NQ92VEPM9SJY1MU7SK94I5QEBGS75UKKE5"

module.exports = {
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    localhost: {
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },
      {
        version: "0.6.12",
      },
      {
        version: "0.4.19",
      },
    ],
  },
};
