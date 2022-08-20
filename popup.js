async function addOverlay(){
  const tip = document.createElement("div");
  tip.id = "tipForJobRecorder";
  tip.style.position = "fixed";
  tip.style.backgroundColor = "blue";
  tip.style.top = "0px";
  tip.style.right = "0px"
  tip.style.zIndex = "9999999";
  tip.style.opacity = "70%"
  tip.textContent = "QuickMode"
  tip.style.fontSize = "40px"
  tip.style.display = "none"
  document.body.appendChild(tip);
}

function showOverlay(){
  const tip = document.getElementById("tipForJobRecorder");
  tip.style.display = "initial"
}
function hideOverlay(){
  const tip = document.getElementById("tipForJobRecorder");
  tip.style.display = "none"
}

async function download(filename) {
  let {savedData} = await chrome.storage.sync.get("savedData")
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(savedData));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function addDataFromFile(e){
  reset()
  if( e.target.files[0] ){
    const reader = new FileReader();
    reader.onload = (e) => {
      let savedData = e.target.result;
      chrome.storage.sync.set({savedData})
    }
    reader.readAsText(e.target.files[0])
  }

}

//click on window
//get object from window
//get text from object
//store text into storage and update ui with 


async function toggleQuickTip(){
  let {quickMode} = await chrome.storage.sync.get("quickMode");
  quickMode = !quickMode
  await chrome.storage.sync.set({quickMode})
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: (quickMode ? (showOverlay) : (hideOverlay))
  });
}


async function save(){
  const inputs = document.getElementsByClassName("formInput");
  let {savedData} = await chrome.storage.sync.get("savedData")
  for( let i = 0; i < inputs.length; i++ ){
    savedData = savedData + inputs[i].value + ",";
  }
  let date = new Date()
  savedData = savedData + date.toString() + "\n"
  await chrome.storage.sync.set({savedData});
  clearFormInput()
}

async function clearFormInput(){
  let {formInput} = await chrome.storage.sync.get("formInput")
  for(let i = 0; i < formInput.length; i++){
    formInput[i] = "";
  }
  chrome.storage.sync.set({formInput})
  let formIndex = 0;
  chrome.storage.sync.set({formIndex})
}

async function reset(){
  clearFormInput()
  let savedData = "";
  chrome.storage.sync.set({savedData})
}

function buildForm(){
  chrome.storage.sync.get("formInfo", async ({formInfo}) => {
    const form = document.getElementById("formInfo");
    formInfo.forEach( async (option, index) => {
      //Adding input fields
      let input = document.createElement("input");
      const {formInput} = await chrome.storage.sync.get("formInput");
      input.value = formInput[index];
      input.type = "text";
      input.classList.add("formInput");
      input.placeholder = option;
      form.appendChild(input);
    })
    if(formInfo.length > 0){
      //add file
      //let {file} = await chrome.storage.sync.get("file")
      document.getElementById("file").addEventListener("input", addDataFromFile );
      
      //save
      document.getElementById("save").addEventListener("click", save)
      //reset
      document.getElementById("reset").addEventListener("click", reset)

      //download
      document.getElementById("download").addEventListener("click", () => {download("jobData"); reset()})
      //document.getElementById("download").addEventListener("click", saveToFile)

      //toggle quick mode
      let {quickMode} = await chrome.storage.sync.get("quickMode")
      document.getElementById("quickMode").checked = quickMode 
      document.getElementById("quickMode").addEventListener("click", toggleQuickTip);
    
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: addOverlay
      });      
    }
    else{
      const cover = document.getElementById("cover");
      cover.textContent = "No form info provided"
      cover.style.display = "initial"
    }
  })

}


buildForm();


window.onload = (e) => {
  const cover = document.getElementById("cover");
  cover.style.display = "none";
}

