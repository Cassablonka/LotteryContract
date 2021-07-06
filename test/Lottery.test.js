const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const {
  interface,
  bytecode
} = require('../compile');

let accounts;
let contractLottery;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  contractLottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
    })
    .send({
      from: accounts[0],
      gas: 1000000
    });
});

describe('Lottery', () => {
  it('Deploys the Contract', () => {
    assert.ok(contractLottery.options.address);
  });

  it('Letting a single player to enter', async () => {
    await contractLottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await contractLottery.methods.allPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[1], players[0]);
    assert.equal(1, players.length);
  });

  it('Letting multiple players to enter', async () => {
    await contractLottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await contractLottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await contractLottery.methods.enter().send({
      from: accounts[3],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await contractLottery.methods.enter().send({
      from: accounts[4],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await contractLottery.methods.allPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[1], players[0]);
    assert.equal(accounts[2], players[1]);
    assert.equal(accounts[3], players[2]);
    assert.equal(accounts[4], players[3]);
    assert.equal(4, players.length);
  });

  it('Check if minimum amount of ether is sent', async () => {
    try {
      await contractLottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.01', 'ether')
      });
      throw (false);
    } catch (err) {
      assert.ok(err);
    }
  });

  it('Only manager can call pickWinner', async () => {
    await contractLottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    try {
      await contractLottery.methods.pickWinner().send({
        from: accounts[1]
      });
      throw (false);
    } catch (err) {
      assert.ok(err);
    }
  });

  it('Money is sent to winner and players array is reset', async () => {
    await contractLottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);

    await contractLottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const finalBalance = await web3.eth.getBalance(accounts[0]);

    const diff = finalBalance - initialBalance;
    assert(diff > web3.utils.toWei('1.9', 'ether'));

    const players = await contractLottery.methods.allPlayers().call({
      from: accounts[0]
    });
    assert.equal(0, players.length)
  });
});
