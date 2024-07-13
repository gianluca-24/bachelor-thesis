//bild review

const username = window.myApp.user;

fetch('/review/list/'+username)
.then(response => response.json())
.then(data => {
    var box_rev = document.getElementById('container-reviews-grid');
    var card;

    for (var i = 0; i < data.length; i++) {
        card = createHTML(`
        <div id='reviews-post'>
            <h1 class="box-title">${data[i].title}</h1>
            <h3 class="box-subtle">${data[i].username}</h3>
            <p class="box-text">${data[i].rev}</p>
         </div>
        `);
        box_rev.appendChild(card);
    }

})
.catch(error => console.error(error));

fetch("/users/get_post/"+username)
.then(response => response.json())
.then(data => {
    var container = document.getElementById('post-container');
    var post;

    for (var i = 0; i < data.length; i++){
        console.log("data[i]", data[i]);
        post = createHTML(`
                        <div class="post">
                            <h3>${data[i].username}</h3>
                            <p>${data[i].text}</p>
                            ${data[i].img_src ? `<img src="../../uploads/${data[i].img_src}" style="max-width: 20%; max-height: auto; margin-bottom: 20px;" />` : ''}
                       </div>
        `);
        container.appendChild(post);
    }

});

fetch('/profile/list/'+username)
.then(response => response.json())
.then(data => {
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