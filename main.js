console.log("hello world");

const serverUrl = "https://o3hhzsfj1trr.usemoralis.com:2053/server";
      const appId = "nGXhWCPzyinol9YPoiH2FHexUBVQHetmSYhAUYNW";
      Moralis.start({ serverUrl, appId });

let homepage = "http://127.0.0.1:5500/index.html"
if(Moralis.User.current() == null && window.location.href != homepage){
      document.querySelector('body').style.display = 'none';
      window.location.href = "index.html";
}

login = async () => {
      await Moralis.authenticate().then(async function (user) {
            console.log('logged in')
            user.set("name", document.getElementById('user-username').value);
            user.set("email", document.getElementById('user-email').value)
            await user.save();
            window.location.href = "dashboard.html"; // this method is just a workaround. Would have a proper routing solution in dapp

        })
}

logout = async () => {
      await Moralis.User.logOut();
      window.location.href = "index.html";
}

getTransactions = async () => {
      console.log('transactions called');
      const options = {
            chain: "eth",
            address: "0xBf8ce6Fb50dF2C64e737B7dB5Ccedf7056888d34",
            
          };
      const transactions = await Moralis.Web3API.account.getTransactions(options);
      console.log(transactions);

if(transactions.total >= 0 ){
      let table = `
      <table class = "table">
      <thread>
            <tr>
                  <th scope ="col">Transaction</th>
                  <th scope ="col">Block Number</th>
                  <th scope ="col">Age</th>
                  <th scope ="col">Type</th>
                  <th scope ="col">Fee</th>
                  <th scope ="col">Value</th>
            <tr>
      <thread>
      <tbody id=theTransactions">
      </tbody>
      </table>
      `

      document.querySelector('#tableOfTransactions').innerHTML = table;

      transactions.result.array.forEach(element => {
            let content = `
            <tr>
                  <td><a href='https://rinkeby.etherscan.io/tx/${element.hash}' target="_blank" rel="noopener noreferrer">${element.hash}</a></td>
                  <td><a href='https://rinkeby.etherscan.io/block/${element.block_number}' target="_blank" rel="noopener noreferrer">${element.block_number}</td>
                  <td>${millisecondsToTime( Date.parse(new Date()) - Date.parse(element.block_timestamp))}</td>
                  <td>${element.from_address == Moralis.User.current().get('ethAddress') ? 'Outgoing' : 'Incoming'}</td>
                  <td>${(element.gas * element.gas_price) / 1e18.toFixed(5)} ETH</td>
                  <td>${(element.value / 1e18.toFixed(5) )} ETH</td>
            <tr>
            `
            theTransactions.innerHTML += content;
      });
}


millisecondsToTime = (ms) => {
      let minutes = Math.floor(ms / (1000 * 60));
      let hours = Math.floor(ms / (1000 * 60 * 60));
      let days = Math.floor(ms / (1000 * 60 * 60 * 24));

      if(days < 1) {
            if(hours < 1){
                  if(minutes < 1){
                        return `less than a minute ago`
                  } else return `${minutes} minute(s) ago`
            } else return `${hours} hour(s) ago`
      } else return `${days} day(s) ago`
}

}

getBalances = async () => {
      console.log('balances called');
      const ethBalance = await Moralis.Web3API.account.getNativeBalance();
      const rinkebyBalance = await Moralis.Web3API.account.getNativeBalance({chain: "rinkeby"});
      const ropstenBalance = await Moralis.Web3API.account.getNativeBalance({chain: "ropsten"});
      console.log(`${(ethBalance.balance / 1e18.toFixed(5))} ETH`);
      console.log(`${(rinkebyBalance.balance / 1e18.toFixed(5))} ETH`);
      console.log(`${(ropstenBalance.balance / 1e18.toFixed(5))} ETH`);

      let content = document.querySelector('#userBalances').innerHTML = `
      <table class = "table">
      <thread>
            <tr>
                  <th scope ="col">Token</th>
                  <th scope ="col">Balance</th>
            <tr>
      <thread>
      <tbody">
            <tr>
                  <th>Ether</th>
                  <td>${(ethBalance.balance / 1e18.toFixed(5))}</td>
            </tr>
            <tr>
            <th>Ropsten</th>
            <td>${(ropstenBalance.balance / 1e18.toFixed(5))}</td>
      </tr>
      <tr>
            <th>Rinkeby</th>
            <td>${(rinkebyBalance.balance / 1e18.toFixed(5))}</td>
      </tr>

      </tbody>
      </table>
      `
}

getNFTs = async () => {
      console.log('NFTs clicked');
      let maticNfts = await Moralis.Web3API.account.getNFTs({chain: "matic"});
      console.log(maticNfts);
      let tableOfNFTs = document.querySelector('#tableOfNFTs')
      if(maticNfts.result.length > 0){
            maticNfts.result.forEach(nft => {
                  // let metadata = JSON.parse(nft)
                  let content = `
                              <div class="card col-md-3">
            
            <div class="card-body">
            <h5 class="card-title">${nft.name}</h5>
            <p class="card-text">${nft.token_hash}</p>
            </div>
            </div>
                  `

            tableOfNFTs.innerHTML += content;
            })
      }
}

{/* <img src="${fixURL(metadata.image_url)}" class="card-img-top" height=300> */}

fixURL = (url) => {
      if(url.startsWith("ipfs")){
            return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://").slice(-1)
      }
      else{
            return url + "?format=json"
      }
}


if(document.querySelector('#btn-login') != null) {
      document.querySelector('#btn-login').onclick = login;
}
if(document.querySelector('#btn-logout') != null) {
      document.querySelector('#btn-logout').onclick = logout;
}

if(document.querySelector('#get-transactions-link') != null) {
      document.querySelector('#get-transactions-link').onclick = getTransactions;
}

if(document.querySelector('#get-balances-link') != null) {
      document.querySelector('#get-balances-link').onclick = getBalances;
}

if(document.querySelector('#get-nfts-link') != null) {
      document.querySelector('#get-nfts-link').onclick = getNFTs;
}
