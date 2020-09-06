import Web3 from 'web3';
import electionArtefact from '../build/contracts/Election.json';

import utils from './utils.js';

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

  render: async function() {
    let electionInstance;
    let loader = document.querySelector('#loader');
    let content = document.querySelector('#content');

    utils.elShow(loader);
    utils.elHide(content);

    // Load account data
    document.querySelector('#account').textContent =
      `Your account ${ App.accounts[0] }`;

    // Load contract data
    electionInstance = App.contracts.Election;
    const candidatesCount = await electionInstance.methods.candidatesCount().call();
    const getCandidatePromises = [];
    for (let idx = 1; idx <= candidatesCount; ++idx) {
      getCandidatePromises.push(
        electionInstance.methods.candidates(idx).call(),
      );
    }
    const candidates = (await Promise.all(getCandidatePromises))
      .map(
        ({ id, name, voteCount }) => ({ id, name, voteCount }),
      );
    console.log(candidates);

    // Render live results
    let candidateResultsHtml = '';
    let candidateSelectHtml = '';
    candidates.forEach((candidate) => {
      const { id, name, voteCount } = candidate;
      candidateResultsHtml +=
        `<tr><td>${id}</td><td>${name}</td><td>${voteCount}</td></tr>`;
      candidateSelectHtml +=
        `<option value="${id}">${name}</option>`;
    });
    const candidatesSelectEl =
      document.querySelector('#candidatesSelect');
    candidatesSelectEl.innerHTML = candidateSelectHtml;
    const candidateResultsEl =
      document.querySelector('#candidatesResults');
    candidateResultsEl.innerHTML = candidateResultsHtml;

    // Determine whether to display ballot to this account
    const currentAccountHasVoted =
      await electionInstance.methods.voters(App.accounts[0]).call();
    console.log('currentAccountHasVoted', currentAccountHasVoted);
    if (currentAccountHasVoted) {
      const ballotEl = document.querySelector('#ballot');
      utils.hideEl(ballotEl);
    }
  }
};
