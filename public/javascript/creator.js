const part2Value = window.myApp.user;
const part3Value = window.myApp.surname;

fetch(`/profile/getRole?surname=${encodeURIComponent(part3Value)}&name=${encodeURIComponent(part2Value)}`)
  .then(response => {
    if (response.ok) {
      return response.json(); // Ottieni il JSON dalla risposta
    } else {
      console.error('Si è verificato un errore durante la richiesta GET');
    }
  })
  .then(data => {
    const roleObject = data[0]; // Estrai il primo oggetto dall'array
    const role = roleObject.ruolo; // Estrai il valore del ruolo dall'oggetto
    if (role === 'organizer') { // Verifica il ruolo
      // Creazione del div solo se il ruolo è "organizer"
      const createValueDiv = document.getElementById('createValue');
      
      
      createValueDiv.innerHTML += `
      <center><h2 style="color: brown;">CREATE THE BEST PARTY EVER! </h2></center>
      <br />
      <br />
      <center><button id="openCreatePopup" onclick="toggleCreatePopup()">Create NOW!</button></center>
      <br />
    
      <div class="popup" id="popup-create-party" style="display: none;">
        <div class="popup-content">
          <form method="post" action="/profile/addToMap">
            <div class="fields">
              <div class="field">
                <label for="organizerName">Nome Organizzatore</label>
                <input type="text" name="organizerName" id="organizerName" required/>
              </div>
              <div class="field">
                <label for="organizerSurname">Cognome Organizzatore</label>
                <input type="text" name="organizerSurname" id="organizerSurname" required/>
              </div>
              <div class="field">
                <label for="companyName">Company Name</label>
                <input type="text" name="companyName" id="companyName" required/>
              </div>
              <div class="field">
                <label for="partyName">Nome Party</label>
                <input type="text" name="partyName" id="partyName" required/>
              </div>
              <div class="field">
                <label for="partyDate">Giorno</label>
                <input type="date" name="partyDate" id="partyDate" required/>
              </div>
            </div>
            <ul class="actions">
              <li><input type="submit" value="Let's go" /></li>
            </ul>
          </form>
        </div>
      </div>
    `;
    // Aggiungi un listener al click sul pulsante "Let's go"
const openCreatePopupButton = document.getElementById('openCreatePopup');
openCreatePopupButton.addEventListener('click', function() {
  const organizerName = document.getElementById('organizerName').value;
  const organizerSurname = document.getElementById('organizerSurname').value;
  const companyName = document.getElementById('companyName').value;
  const partyName = document.getElementById('partyName').value;
  const partyDate = document.getElementById('partyDate').value;

  // Crea una query string con i valori ottenuti
  const queryString = `organizerName=${encodeURIComponent(organizerName)}&organizerSurname=${encodeURIComponent(organizerSurname)}&companyName=${encodeURIComponent(companyName)}&partyName=${encodeURIComponent(partyName)}&partyDate=${encodeURIComponent(partyDate)}`;

  // Esegui la richiesta GET alla route "/profile/addToMap" con la query string
  fetch(`/profile/addToMap?${queryString}`)
    .then(response => {
      if (response.ok) {
        console.log('Richiesta GET inviata con successo');
      } else {
        console.error('Si è verificato un errore durante la richiesta GET');
      }
    })
    .catch(error => {
      console.error('Si è verificato un errore:', error);
    });
});


    }
  })
  .catch(error => {
    console.error('Si è verificato un errore:', error);
  });
