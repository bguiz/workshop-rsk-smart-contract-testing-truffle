import Web3 from 'web3';
import electionArtefact from '../build/contracts/Election.json';

document.addEventListener('DOMContentLoaded', onDocumentLoad);

function onDocumentLoad() {
  App.init();
}

const App = {
  web3: null,
  contracts: {},
  accounts: [],

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (typeof window.ethereum !== 'undefined') {
      // New web3 provider
      // As per EIP1102 and EIP1193
      // Ref: https://eips.ethereum.org/EIPS/eip-1102
      // Ref: https://eips.ethereum.org/EIPS/eip-1193
      try {
        // Request account access if needed
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });
        // Accounts now exposed, use them
        this.updateAccounts(accounts);
      } catch (error) {
        // User denied account access
        console.error('User denied web3 access');
        return;
      }
      App.web3 = new Web3(window.ethereum);
    }
    else if (window.web3) {
      // Deprecated web3 provider
      App.web3 = new Web3(web3.currentProvider);
      // no need to ask for permission
    }
    // No web3 provider
    else {
      console.error('No web3 provider detected');
      return;
    }
    return App.initContract();
  },

  updateAccounts: async function(accounts) {
    App.accounts = accounts || await App.web3.eth.getAccounts();
    console.log('updateAccounts', accounts[0]);
  },

  initContract: async function() {
    let networkId = await App.web3.eth.net.getId();
    console.log('networkId', networkId);

    let deployedNetwork = electionArtefact.networks[networkId];
    if (!deployedNetwork) {
      console.error('No contract deployed on the network that you are connected. Please switch networks.');
      return;
    }
    console.log('deployedNetwork', deployedNetwork);

    App.contracts.Election = new App.web3.eth.Contract(
      electionArtefact.abi,
      deployedNetwork.address,
    );
    console.log('Election', App.contracts.Election);

    return App.render();
  },

  render: function() {}
};
