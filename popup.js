// DOM Elements
const templateList = document.getElementById('template-list');
const templateNameInput = document.getElementById('template-name');
const templateContentInput = document.getElementById('template-content');
const saveButton = document.getElementById('save-template');

// Load and display saved templates on popup load
window.onload = function() {
  loadTemplates();
};

// Save the template to Chrome's local storage
saveButton.addEventListener('click', function() {
  const templateName = templateNameInput.value.trim();
  const templateContent = templateContentInput.value.trim();

  if (templateName && templateContent) {
    // Get stored templates and update with the new one
    chrome.storage.local.get({ emailTemplates: [] }, (data) => {
      const templates = data.emailTemplates;
      const existingIndex = templates.findIndex(t => t.name === templateName);

      // If the template exists, update it; otherwise, add a new one
      if (existingIndex > -1) {
        templates[existingIndex].content = templateContent;
      } else {
        templates.push({ name: templateName, content: templateContent });
      }

      // Save updated templates
      chrome.storage.local.set({ emailTemplates: templates }, loadTemplates);

      // Clear input fields
      templateNameInput.value = '';
      templateContentInput.value = '';
    });
  } else {
    alert('Please enter both a template name and content.');
  }
});

// Load templates from storage and display them
function loadTemplates() {
  chrome.storage.local.get({ emailTemplates: [] }, (data) => {
    const templates = data.emailTemplates;
    templateList.innerHTML = ''; // Clear the current list

    templates.forEach((template, index) => {
      const templateDiv = document.createElement('div');
      templateDiv.style.marginBottom = '10px';

      // Button to open the template for editing
      const templateButton = document.createElement('button');
      templateButton.innerText = template.name;
      templateButton.onclick = () => openTemplate(template); // Call the openTemplate function

      const deleteButton = document.createElement('button');
      deleteButton.innerText = 'Delete';
      deleteButton.style.marginLeft = '10px';
      deleteButton.onclick = () => deleteTemplate(index);

      templateDiv.appendChild(templateButton);
      templateDiv.appendChild(deleteButton);
      templateList.appendChild(templateDiv);
    });
  });
}

// Function to open the selected template and populate the fields
function openTemplate(template) {
  templateNameInput.value = template.name; // Fill name field
  templateContentInput.value = template.content; // Fill content field
}

// Insert the selected template into the active email compose field
function insertTemplate(templateContent) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: insertText,
      args: [templateContent]
    });
  });
}

function insertText(templateContent) {
  const activeElement = document.activeElement;
  if (activeElement && activeElement.tagName === 'TEXTAREA') {
    activeElement.value = templateContent;
  }
}

// Delete the template from storage
function deleteTemplate(index) {
  chrome.storage.local.get({ emailTemplates: [] }, (data) => {
    const templates = data.emailTemplates;
    templates.splice(index, 1); // Remove the template
    chrome.storage.local.set({ emailTemplates: templates }, loadTemplates);
  });
}
