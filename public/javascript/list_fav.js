fetch('/profile/list/0')
  .then(response => response.json())
  .then(data => {

    // console.log(data); 

    var grid = document.getElementById("grid-layout-cards");
    var card;
    
    for (var i = 0; i < data.length; i++){
        // console.log(data[i].website);
        card = createHTML(`
        <div class="card">
            <div class="card-body" style="position:relative;">
            <h5 class="card-title" style="color: black;">${data[i].title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${data[i].type}</h6>
            <h6 class="card-subtitle mb-2 text-muted">${data[i].address}, ${data[i].dist} KM</h6>
            <h6 class="card-subtitle mb-2 text-muted">${data[i].phone != null ? data[i].phone : ''}</h6>
            <p class="card-text"><a href="${ data[i].website != null ? data[i].website : ''}" target=”_blank” class="card-link">${ data[i].website != null ? "Link locale" : ''}</a></p>
            </div>
          </div>
        `);

      grid.appendChild(card);
    }
  })
  .catch(error => console.error(error));

  function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }