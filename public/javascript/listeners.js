function handlePopUp(){
    const container = document.getElementById("popup-container");
    if (!container.style.display || container.style.display == "none")
        container.style.display = "flex";
    else container.style.display = "none";
}

function deletePopUp(){
    // document.getElementById("popup-container").style.display = "none";
    window.history.replaceState(null, null, '/');
    fetch("/users/deleteProfile",  {
        method: 'POST',
    });
    window.location.replace('/');
    return;
}

function friendsPopUp(){
    const popup = document.getElementById("popup-friends");
    const button = document.getElementById("openPopup");
    if (!popup.style.display || popup.style.display == "none"){
        popup.style.display = "flex";
        button.classList.add('hidden');
    }
    else {
        popup.style.display = "none";
        button.style.display = "visible";
    }
}

function moveNav() {
    var sidebar = document.getElementById("mySideBar");
    var sidebarWidth = sidebar.style.width;
    if ($(window).width() >= 768){
      if (sidebarWidth === '250px') {
          sidebar.style.width = "0";
          sidebar.style.display = "none";
      }else {
          sidebar.style.width = "250px";
          sidebar.style.display = "block";
      } 
    }
    }

function logOut(){
    window.history.replaceState(null, null, '/');
    fetch("/logout", {
        method: 'POST',
    }
    );
    window.location.replace('/');
    return;
}

document.addEventListener("DOMContentLoaded", function() {
    const popupButton = document.getElementById("popup-button");
    const popup = document.getElementById("post-popup");
    const closePopup = document.getElementById("close-popup");
      
    popupButton.addEventListener("click", () => {
        if (popup.style.display == "none")
            popup.style.display = "block";
        else popup.style.display == "none"
    });
      
    closePopup.addEventListener("click", () => {
        popup.style.display = "none";
    });
    
    window.addEventListener("click", (event) => {
        if (event.target === popup) {
        popup.style.display = "none";
        }
    });
    
    });