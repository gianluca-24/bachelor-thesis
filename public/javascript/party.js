

fetch('/profile/getParty')
    .then(response => {
        if (response.ok) {
            return response.json(); 
        } else {
            throw new Error('Si è verificato un errore durante la richiesta GET');
        }
    })
    .then(datas => {
        datas.forEach(item => {

    const nomeOrganizzatore = item.nomeorg;
    const cognomeOrganizzatore = item.cognomeorg;
    const companyName = item.compnome;
    const partyName = item.partyname;
    
    console.log(partyName);

    
    const current_date = item.data;

    const dateObject = new Date(current_date);
    const data = formatDate(dateObject);

    function formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }


    // Ora puoi utilizzare queste variabili per costruire la tua card
    const card = createHTML(`
        <div class="card">
            <div class="card-body" style="position:relative;">
            <br />
                <h4 class="card-title" style="color:brown">${partyName}</h4>
                <br />
                <h5 class="card-subtitle mb-2 text-muted">${nomeOrganizzatore} ${cognomeOrganizzatore}</h5>
                <br />
                <h5 class="card-subtitle mb-2 text-muted">${companyName}</h5>
                <br />
                <h6 class="card-subtitle mb-2 text-muted">${data}</h6>
            </div>
        </div>
    `);

    // Aggiungi la card al tuo elemento DOM
    const gridLayout = document.getElementById('grid-layout-cards');
    gridLayout.appendChild(card);

    })
})
    .catch(error => {
        console.error('Si è verificato un errore:', error);
    });