fetch('/review/list/0')
.then(response => response.json())
.then(data => {
    var box_rev = document.getElementById('container-reviews-grid');
    var card;

    var bin_map = new Map();

    for (var i = 0; i < data.length; i++) {
        var id = "bin" + i;
        card = createHTML(`
        <div id='reviews-post'>
            <h1 class="box-title">${data[i].title}</h1>
            <h3 class="box-subtle">${data[i].username}</h3>
            <p class="box-text">${data[i].rev}</p>
            <button class="trash-button" data-username="${data[i].username}" data-title="${data[i].title}">
                <i class="fas fa-trash" style="color: black;"></i>
            </button>
        </div>`);
        bin_map.set(id,{
            title: data[i].title,
            username: data[i].username,
        });
        box_rev.appendChild(card);
    }
    //aggiungo listener
    // Aggiungi un listener a tutti i pulsanti "trash" con la classe "trash-button"
const trashButtons = document.querySelectorAll('.trash-button');

trashButtons.forEach(button => {
    button.addEventListener('click', function(event) {
        const username = this.getAttribute('data-username');
        const title = this.getAttribute('data-title');
        
        // Esegui la chiamata al server con username e title
        fetch('/review/list/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, title })
        })
        .then(response => {
            console.log("lo stronzo ha risposto");
            window.location.href = '/users/profile';
        })
        .catch(error => {
            // Gestisci errori di rete o altre eccezioni
        });
    });
});

        
})
.catch(error => console.error(error));

function binClick(){
    window.open("/users/profile","_self");
}

function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }