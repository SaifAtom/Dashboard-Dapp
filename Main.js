console.log('hello world');


// connect to Moralis server
const serverUrl = "https://uexotf1mkeqb.usemoralis.com:2053/server";  
const appId = "dGevxHJETEUZ87OM9tjfG0zjTa7UOVcCu0Rm1S0V";     
Moralis.start({ serverUrl, appId }); 

let homepage = "http://127.0.0.1:5500/index.html"
if(Moralis.User.current() == null && window.location.href != homepage){
    document.querySelector('body').style.display = 'none';
    window.location.href = "index.html";
}

login = async() => {
    await Moralis.authenticate().then(async function (user) {
            console.log("logged in");
            user.set("username", document.getElementById('user-id').value);
            user.set("EMAIL", document.getElementById('user-email').value);
            await user.save();
            window.location.href = "Dashboard.html";
    })
}

logout = async () => {
    await Moralis.User.logOut();
    window.location.href = "index.html";
}


getTransactions = async() => {
    const options = { chain: "rinkeby", address: "0x351aA16Fa8858c4D23bAe0A2136a4Eac38b9722B" };
    const transactions = await Moralis.Web3API.account.getTransactions(options);
    console.log(transactions);
    if(transactions.total > 0){
        let table = `	
        <table class ="table">
           <thead>
            <tr>
                
                <th scope="col">Transaction</th>
                <th scope="col">Bloc Number</th>
                <th scope="col">Age</th>
                <th scope="col">Type</th>
                <th scope="col">Fee</th>
                <th scope="col">Value</th>   
               
            </tr>   
            </thead>
            <tbody id ="thetransactions">
                </tbody> 
        </table>
        `	
        document.querySelector('#tableoftransactions').innerHTML = table;
        transactions.result.forEach(t => {
            let content = `
   
             <tr>
                 
                 <td><a href = 'https://rinkeby.etherscan.io/tx/${t.hash}' target ="_blank rel="noopener noreferrer"">${t.hash}</a></td>
                 <td><a href = 'https://rinkeby.etherscan.io/block/${t.block_number}' target ="_blank rel="noopener noreferrer"">${t.blocknumber}</a></td>
                 <td>${millisecondsoftime(Date.parse(new Date()) - Date.parse(t.block_timestamp))}</td>
                 <td>${t.from_address == Moralis.User.current().get('ethAddress') ? 'outgoing' : 'incoming'}</td>
                 <td>${((t.gas * t.gas_price) / 1e18).toFixed(5)} ETH</td>
                 <td>${(t.value / 1e18).toFixed(5)} ETH</td>   
                
             </tr>
            `
            thetransactions.innerHTML += content;

        })

    }

}

millisecondsoftime = (ms) => {
    let minutes = Math.floor(ms / (1000 * 60));
    let hours = Math.floor(ms / (1000 * 60 * 60)); 
    let days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if(days < 1){
        if(hours < 1){
            if(minutes < 1){
                return `less than a minute ago`
            } else return `${minutes} minutes(s) ago`
        }else return `${hours} hours(s) ago`
    }else return `${days} days(s) ago`
}

getBalances = async() => {
    const ethbalance = await Moralis.Web3API.account.getNativeBalance({address: "0x351aA16Fa8858c4D23bAe0A2136a4Eac38b9722B"});
    const ropstenbalance = await Moralis.Web3API.account.getNativeBalance({chain: "ropsten", address:"0x351aA16Fa8858c4D23bAe0A2136a4Eac38b9722B"});
    const rinkebybalance = await Moralis.Web3API.account.getNativeBalance({chain: "rinkeby", address:"0x351aA16Fa8858c4D23bAe0A2136a4Eac38b9722B"});


    let content = document.querySelector('#userbalances').innerHTML =  `	
    <table class ="table">
       <thead>
        <tr>
            
            <th scope="col">Chain</th>
            <th scope="col">Balance</th>        
        </tr>   
        </thead>
        <tbody>
            <tr>
                <th>Ether</th>
                <td>${(ethbalance.balance / 1e18).toFixed(5)}</td>
            </tr>
            <tr>    
                <th>Ropsten</th>
                <td>${(ropstenbalance.balance / 1e18).toFixed(5)}</td>
            </tr>
            <tr>
                <th>Rinkeby</th>
                <td>${(rinkebybalance.balance / 1e18).toFixed(5)}</td>
            </tr>
        </tbody> 
    </table>
    `	

}  

getNFTs = async () => {
    const options = { chain: 'ropsten', address: '0x351aA16Fa8858c4D23bAe0A2136a4Eac38b9722B' };
    const NFTs = await Moralis.Web3API.account.getNFTs(options);
    console.log(NFTs);
    let tableofNFTs = document.querySelector('tableofNFTs');
    if(NFTs.result.length > 0){
        NFTs.result.forEach(n =>{
            let metadata = JSON.parse(n.metadata);
            let content = `
                <div class="card col-md-3" >
                <img src= "${fixURL(metadata.image_url)}" class="card-img-top" height = 300>
                <div class="card-body">
                <h5 class="card-title">${metadata.name}</h5>
                <p class="card-text">${metadata.description}</p>
                </div>
                </div>
            `
            tableofNFTs.innerHTML += content;
        })

    }else{console.log('no NFTs')}

}

fixURL = (url) => {
    if(url.startWith("ipfs")) {
        return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://").slice(-1)
    }
    else {
        return url + "?format=json"
    }
}



if(document.querySelector('#btn-logout') != null)
{
    document.querySelector('#btn-logout').onclick =  logout;

}

if(document.querySelector('#btn-login') != null)
{
    document.querySelector('#btn-login').onclick =  login;
}


if(document.querySelector('#get-transactions') != null)
{
    document.querySelector('#get-transactions').onclick =  getTransactions;
}

if(document.querySelector('#get-balances') != null)
{
    document.querySelector('#get-balances').onclick =  getBalances;
}

if(document.querySelector('#get-NFTs') != null)
{
    document.querySelector('#get-NFTs').onclick =  getNFTs;
}

