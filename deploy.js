const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {
  interface,
  bytecode
} = require('./compile');

const provider = new HDWalletProvider(
  'trend song build option fragile movie embark mammal meadow whisper turn exhibit',
  'https://rinkeby.infura.io/v3/d5197722eda84c4495a1f942f09f022c'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Deploying contract from address : ', accounts[0]);

  const lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode
    })
    .send({
      from: accounts[0],
      gas: 1000000
    })

  console.log('Interface', interface);
  console.log('Contract has been deployed to address : ', lottery.options.address);
}

deploy();
