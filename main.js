// Make the window draggable
dragElement(document.getElementById("window"));

// Make an element draggable
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "-titlebar")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "-titlebar").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Make an element resizable
function makeResizableDiv(div) {
  const element = document.querySelector(div);
  const resizers = document.querySelectorAll(div + ' .resizer')
  const minimum_size = 20;
  let original_width = 0;
  let original_height = 0;
  let original_x = 0;
  let original_y = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;
  for (let i = 0;i < resizers.length; i++) {
    const currentResizer = resizers[i];
    currentResizer.addEventListener('mousedown', function(e) {
      e.preventDefault()
      original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
      original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
      original_x = element.getBoundingClientRect().left;
      original_y = element.getBoundingClientRect().top;
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)
    })
    
    function resize(e) {
      if (currentResizer.classList.contains('bottom-right')) {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      }
      else if (currentResizer.classList.contains('bottom-left')) {
        const height = original_height + (e.pageY - original_mouse_y)
        const width = original_width - (e.pageX - original_mouse_x)
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
        if (width > minimum_size) {
          element.style.width = width + 'px'
          element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
        }
      }
      else if (currentResizer.classList.contains('top-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
          element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
        }
      }
      else {
        const width = original_width - (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
          element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
          element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
        }
      }
    }
    
    function stopResize() {
      window.removeEventListener('mousemove', resize)
    }
  }
}

// Make a window resizable
makeResizableDiv('#window')

// List of windows
var windows = [];

var currentZindex = 20;

// Function to open a window
function openWindow(title, url, icon) {
  // Clone the default window with id "window" to the list of windows and append it to the div "windows"
  var newWindow = document.getElementById("window").cloneNode(true);
  newWindow.id = "window" + windows.length;
  newWindow.style.display = "block";
  // Set the window's iframe to the url
  newWindow.getElementsByTagName("iframe")[0].src = url;
  // Set the window's title to the title
  newWindow.getElementsByClassName("title-bar-text")[0].innerHTML = title;
  // Change the id of the div with the id "window-titlebar" to the id of the window + "-titlebar"
  newWindow.getElementsByTagName("div")[0].id = newWindow.id + "-titlebar";
  // Make the selected window stay on top
  newWindow.onmousedown = function() {
    newWindow.style.zIndex = currentZindex;
    currentZindex++;
  };
  // Add the window to the list of windows
  windows.push(newWindow);
  // Append the window to the div "windows".
  document.getElementById("windows").appendChild(newWindow);
  // Make the window draggable and resizable
  dragElement(newWindow);
  makeResizableDiv("#" + newWindow.id);
  // Add window to taskbar
  addOpenToTaskbar(title, url, icon, newWindow.id);
  
}

// Function to maximize a window
function maximizeWindow(id) {
  // Get the window
  var window = document.getElementById(id);
  // If the window is maximized, unmaximize it
  if (window.classList.contains("maximized")) {
    window.classList.remove("maximized");
    window.style.top = window.getAttribute("data-top");
    window.style.left = window.getAttribute("data-left");
    window.style.width = window.getAttribute("data-width");
    window.style.height = window.getAttribute("data-height");
    // Make the window draggable
    dragElement(window);
    // Make the window resizable
    var resizers = document.querySelectorAll("#" + id + " .resizer");
    for (var i = 0; i < resizers.length; i++) {
      resizers[i].style.display = "block";
    }
    // Make the control button that says "Restore" say "Maximize"
    window.getElementsByClassName("mx-button")[0].setAttribute("aria-label", "Maximize");
  // If the window is not maximized, maximize it
  } else {
    window.classList.add("maximized");
    window.setAttribute("data-top", window.style.top);
    window.setAttribute("data-left", window.style.left);
    window.setAttribute("data-width", window.style.width);
    window.setAttribute("data-height", window.style.height);
    window.style.top = "0";
    window.style.left = "0";
    window.style.width = "100%";
    window.style.height = "100%";
    // Make the window unable to be dragged
    document.getElementById(id + "-titlebar").onmousedown = null;
    // Make the window unable to be resized
    var resizers = document.querySelectorAll("#" + id + " .resizer");
    for (var i = 0; i < resizers.length; i++) {
      resizers[i].style.display = "none";
    }
    // Make the control button that says "Maximize" say "Restore"
    window.getElementsByClassName("mx-button")[0].setAttribute("aria-label", "Restore");
  }
}

function closeWindow(id) {
  var window = document.getElementById(id);
  var tbIcon = document.getElementById("taskbar-item" + (parseInt(id.split("window")[1]) + 1))
  
  window.remove();
  tbIcon.remove();
}

function minimizeWindow(id) {
  var window = document.getElementById(id);
  window.style.display = "none";
}

function addToTaskbar(title, url, icon) {
  // Clone the default taskbar item with id "taskbar-item" to the list of taskbar items and append it to the div "taskbar-items"
  var newTaskbarItem = document.getElementById("taskbar-item").cloneNode(true);
  newTaskbarItem.id = "taskbar-item" + windows.length;
  
  // Set the taskbar item's image to the icon, but if there's no icon, set it to hide the image
  newTaskbarItem.src = icon;
  // Add the taskbar item to the list of taskbar items
  windows.push(newTaskbarItem);
  // Append the taskbar item to the div "taskbar-items".
  document.getElementById("taskbar").appendChild(newTaskbarItem);
  // Make the taskbar item open the window when clicked
  newTaskbarItem.onclick = function() {
    openWindow(title, url, icon);
  };
}

function addOpenToTaskbar(title, url, icon, id) {
  // Clone the default taskbar item with id "taskbar-item" to the list of taskbar items and append it to the div "taskbar-items"
  var newTaskbarItem = document.getElementById("taskbar-item").cloneNode(true);
  newTaskbarItem.id = "taskbar-item" + windows.length;
  // Set the taskbar item's image to the icon, but if there's no icon, set it to hide the image
  newTaskbarItem.src = icon;
  // add a new class to the taskbar item
  newTaskbarItem.classList.add("tb-icon-open");
  // Add the taskbar item to the list of taskbar items
  windows.push(newTaskbarItem);
  // Append the taskbar item to the div "taskbar-items".
  document.getElementById("taskbar").appendChild(newTaskbarItem);
  // Make the taskbar item open the window when clicked
  newTaskbarItem.onclick = function() {
    document.getElementById(id).style.display = "block";
  };
}

document.addEventListener('contextmenu', function(event) {
  event.preventDefault();
});