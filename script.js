
const $id = id => document.getElementById(id)

const input_masterpass = $id("input_masterpass")
const btn_show_masterpass = $id("btn_show_masterpass")
const input_appname = $id("input_appname")
const input_length = $id("input_length")
const btn_generate = $id("btn_generate")

const output_pass = $id("output_pass")
const btn_copy_output = $id("btn_copy_output")
const btn_show_output = $id("btn_show_output")
const btn_show_appname = $id("btn_show_appname")

btn_copy_output.addEventListener('click', async function (e) {
  e.preventDefault()
  if ( !output_pass.value ) return;
  navigator.clipboard.writeText(output_pass.value);
  await toast("Password copied to clipboard...");
})

btn_show_masterpass.addEventListener('click', async function (e) {
  e.preventDefault()
  const hidden = input_masterpass.type === "password"
  input_masterpass.type = hidden ? "text" : "password"
  btn_show_masterpass.textContent = hidden ? "Hide" : "Show"
})

btn_show_output.addEventListener('click', async function (e) {
  e.preventDefault()
  const hidden = output_pass.type === "password"
  output_pass.type = hidden ? "text" : "password"
  btn_show_output.textContent = hidden ? "Hide" : "Show"
})

btn_show_appname.addEventListener('click', async function (e) {
  e.preventDefault()
  const hidden = input_appname.type === "password"
  input_appname.type = hidden ? "text": "password"
  btn_show_appname.textContent = hidden ? "Hide": "Show"
})

async function generatePassword() {
  const masterpass = input_masterpass.value;
  let appname = input_appname.value;
  let length = input_length.value;

  if (!validateInput()) {
    return
  }
  
  
  // subtract
  length -= 3;

  // get the hash
  let passHash = await sha256(`${masterpass}.login(${appname}, length=${length})`);
  let pass = passHash.substring(0, length);

  // assemble password with `@` for symbol and 2 characters from appname at last
  // finally, force first alphabet character to be uppercase
  // result : at least 1 symbol, at least 1 big and 1 small case character and numbers
  appname = appname.toLowerCase()
  pass = `@${pass}${appname.charAt(0)}${appname.charAt(appname.length - 1)}`
  pass = pass.replace(/[A-Za-z]/, c => c.toUpperCase())

  output_pass.value = pass;
  output_pass.type = "password"
  btn_show_output.textContent = "Show"
}

// change per input
input_appname.addEventListener('input', () => {
  if ( validateInput() ) {
    generatePassword()
  }
})

input_masterpass.addEventListener('input', () => {
  if ( validateInput() ) {
    generatePassword()
  }
})

input_length.addEventListener('input', () => {
  if ( validateInput() ) {
    generatePassword()
  }
})


function validateInput() {
  return input_masterpass.value && input_appname.value && input_length.value >= 8 && input_length.value <= 64
}

async function sha256(message) {
  // utf-8 encode
  const msgBuffer = new TextEncoder().encode(message);
  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function toast(text, showTime = 1000) {

  const toastElem = document.createElement('div');
  toastElem.classList.add('toast')
  toastElem.innerHTML = `
    <div class="inner">
      <span>${text}</span>
    </div>
  `
  document.body.appendChild(toastElem);

  // remove element and resolve after some time
  return new Promise((resolve) => {
    setTimeout(function () {
      toastElem.remove();
      resolve(true);
    }, showTime)
  })
}