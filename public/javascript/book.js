
document.addEventListener('DOMContentLoaded', function() {
    const part2Value = window.myApp.user;
    const part3Value = window.myApp.surname;
    console.log(part2Value);
    console.log(part3Value);
    fetch(`/profile/booking?surname=${encodeURIComponent(part3Value)}&name=${encodeURIComponent(part2Value)}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
  
        const grid = document.getElementById('grid-layout-cards-book');
  
        for (var i = 0; i < data.length; i++) {
          console.log(data[i].title);
          const card = createHTML(`
            <div class="card">
              <div class="card-body" style="position:relative;">
                <h5 class="card-title" style="color: black;">${data[i].title}</h5>
                <h6 class="card-subtitle mb-2 text-muted" id="name">NAME: ${data[i].name}</h6>
                <h6 class="card-subtitle mb-2 text-muted" id="surname">SURNAME:${data[i].surname}</h6>
                <h6 class="card-subtitle mb-2 text-muted" id="table">TABLE:${data[i].table}</h6>
                <h6 class="card-subtitle mb-2 text-muted" id="entries">TICKET:${data[i].entries}</h6>
                <button class="delete-button"><a>Delete</a></button>
              </div>
            </div>
          `);
  
          grid.appendChild(card);
        }
  
        const deleteButtons = document.querySelectorAll('.delete-button');
  
        deleteButtons.forEach(deleteButton => {
          deleteButton.addEventListener('click', function(event) {
            const card = event.target.closest('.card');
            const titleElement = card.querySelector('.card-title');
            const nameElement = card.querySelector('#name');
            const surnameElement = card.querySelector('#surname');
  
            const title = titleElement.textContent;
            const name = nameElement.textContent.split(':')[1].trim();
            const surname = surnameElement.textContent.split(':')[1].trim();
  
            const queryString = `title=${encodeURIComponent(title)}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(surname)}`;
            
            fetch(`/profile/deleteReservation?${queryString}`)
              .then(response => {
                if (response.ok) {
                  console.log('Richiesta GET inviata con successo');
                  window.location.href = '/';
                } else {
                  console.error('Si è verificato un errore durante la richiesta GET');
                }
              })
              .catch(error => {
                console.error('Si è verificato un errore:', error);
              });
          });
        });
      })
      .catch(error => {
        console.error(error);
      });
  });
  
  function createHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }
  