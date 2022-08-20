const formInfo = [
  "Job Name",
  "Company Name",
  "Salary",
  "Experience"
]
const file = null;
let formInput = [];
formInfo.forEach( (info) => {
  formInput.push("")
})
const quickMode = false;
const formIndex = 0;
const savedData = "";

async function saveInfo(info, tab){
  let quickModeResult = await chrome.storage.sync.get("quickMode");
  if(quickModeResult.quickMode){
    let formIndexResult = await chrome.storage.sync.get("formIndex");
    let formInputResult = await chrome.storage.sync.get("formInput");
    let formInfoResult = await chrome.storage.sync.get("formInputResult");
    formInputResult.formInput[formIndexResult.formIndex] = info.selectionText
    await chrome.storage.sync.set(formInputResult)
    formIndexResult.formIndex = (formIndexResult.formIndex + 1) % formInputResult.formInput.length;
    await chrome.storage.sync.set(formIndexResult);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const tip = document.getElementById("tipForJobRecorder");
        tip.textContent = formInfoResult.formInfo[formIndexResult.formIndex]
      }
    });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "record-info",
    title: "Record Info",
    contexts:["selection"],
  })
  chrome.contextMenus.onClicked.addListener(
    saveInfo
  )
  chrome.storage.sync.set({formInfo, quickMode, formIndex, formInput, file, savedData});
});


//chrome.browserAction.onClicked.addListener( )
