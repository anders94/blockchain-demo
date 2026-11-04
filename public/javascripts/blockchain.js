/////////////////////////
// global variable setup
/////////////////////////

// number of zeros required at front of hash
var difficultyMajor = 4;

// 0-15, maximum (decimal) value of the hex digit after the front
var difficultyMinor = 15;  

var maximumNonce = 8;  
var pattern = '';
for (var x=0; x<difficultyMajor; x++) {
  pattern += '0';
  maximumNonce *= 16;
}

pattern += difficultyMinor.toString(16);
var patternLen = pattern.length;

if      (difficultyMinor == 0) { maximumNonce *= 16; }
else if (difficultyMinor == 1) { maximumNonce *= 8; }
else if (difficultyMinor <= 3) { maximumNonce *= 4; }
else if (difficultyMinor <= 7) { maximumNonce *= 2; }


/////////////////////////
// functions
/////////////////////////

function sha256(block, chain) {
  // calculate a SHA256 hash of the contents of the block
  return CryptoJS.SHA256(getText(block, chain));
}

function updateState(block, chain) {
  if ($('#block'+block+'chain'+chain+'hash').val().substr(0, patternLen) <= pattern) {
    $('#block'+block+'chain'+chain+'well').removeClass('well-error').addClass('well-success');
  } else {
    $('#block'+block+'chain'+chain+'well').removeClass('well-success').addClass('well-error');
  }
}

function updateHash(block, chain) {
  $('#block'+block+'chain'+chain+'hash').val(sha256(block, chain));
  updateState(block, chain);
}

function updateChain(block, chain) {
  for (var x = block; x <= 7; x++) { // Increased from 5 to 7 blocks
    if (x > 1) {
      $('#block'+x+'chain'+chain+'previous').val($('#block'+(x-1).toString()+'chain'+chain+'hash').val());
    }
    updateHash(x, chain);
  }
}

function mine(block, chain, isChain) {
  for (var x = 0; x <= maximumNonce; x++) {
    $('#block'+block+'chain'+chain+'nonce').val(x);
    $('#block'+block+'chain'+chain+'hash').val(sha256(block, chain));
    if ($('#block'+block+'chain'+chain+'hash').val().substr(0, patternLen) <= pattern) {
      if (isChain) {
        updateChain(block, chain);
      } else {
        updateState(block, chain);
      }
      break;
    }
  }
}

/////////////////////////
// Add Two New Peers (Peer D and Peer E)
/////////////////////////

var peers = ['A', 'B', 'C', 'D', 'E'];

peers.forEach(peer => {
  for (var block = 1; block <= 7; block++) {
    $(`#block${block}chain${peer}`).on('input', () => updateChain(block, peer));
  }
});

/////////////////////////
// HTML for New Peers and Blocks
/////////////////////////

function addNewPeersAndBlocks() {
  peers.slice(3).forEach(peer => {
    for (let block = 6; block <= 7; block++) {
      $('#blockchain').append(`
        <div id="block${block}chain${peer}" class="block">
          <input id="block${block}chain${peer}previous" type="text" readonly />
          <input id="block${block}chain${peer}data" type="text" placeholder="Data" />
          <input id="block${block}chain${peer}nonce" type="number" value="0" />
          <input id="block${block}chain${peer}hash" type="text" readonly />
          <button onclick="mine(${block}, '${peer}', true)">Mine</button>
        </div>
      `);
    }
  });
}

$(document).ready(() => {
  addNewPeersAndBlocks();
});
