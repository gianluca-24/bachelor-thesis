//prendo la lista dei locali preferiti
fetch('/profile/list/0')
.then(response => response.json())
.then(async data => {

    var selection = document.getElementById('locale');
    var option;
    var found = [];

    for (var i = 0; i < data.length; i++){
        const response = await fetch('/review/list/0');
        const lista_recensiti = await response.json();

        if (lista_recensiti.length > 0){
           found = lista_recensiti.filter(function(lista) {
            return lista.title == data[i].title;
            }); 
        }

        if (found.length == 0){
            option = createHTML(`
            <option value="${data[i].title}">${data[i].title}</option>
            `);
            selection.appendChild(option) 
        }
    }
})
 .catch(error => console.error(error));
 

function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}