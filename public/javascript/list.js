fetch("/jsonFiles/discoList.json")
  .then(function(response) {
    return response.json();
  })
  .then(async function(data) {

var fav_locals = await fetch('/profile/list/0').then(response => response.json())
      .then(data => {
      var local = [];
    for (var j = 0; j < data.length; j++){
//       console.log(data[j]);
      local.push(data[j].title)
    }
    return local;
    })
    .catch(error => console.error(error));
    
    var grid = document.getElementById("grid-layout-cards");
    var card;
    var diz = sortByDistance(data,lt,lg);
    var list_titles = [];
    //var hearts_list = [];
    var hearts_map = new Map();

    var i = 0;

    for (const [key, value] of diz.entries()) {
      if (value > 3.5 || inLista(key.title,list_titles) || !inLista(key.type,banned_types)) continue; 
      list_titles.push(key.title);

      var heart = document.createElement("i");
      //if presente in lista mettilo pieno
      heart.className = inLista(key.title,fav_locals) ? "fa fa-heart" : "fa fa-heart-o";
      // heart.className = "fa fa-heart-o";
      heart.id = "heart"+ i;
      heart.style.right = '10px';
      heart.style.bottom = '10px';
      heart.style.position = 'absolute';
      heart.setAttribute("type","submit");

      // console.log(heart);
      // hearts_list.push(heart);
      hearts_map.set("heart"+i,{
        title: key.title,
        type: key.type,
        address: key.address,
        dist: value.toFixed(2),
        phone: key.phone,
        website: key.website
      });

      card = createHTML(`
        <div class="card">
            <div class="card-body" style="position:relative;">
            <h5 class="card-title">${key.title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${key.type}</h6>
            <h6 class="card-subtitle mb-2 text-muted">${key.address}, ${value.toFixed(2)} KM</h6>
            <h6 class="card-subtitle mb-2 text-muted">${typeof key.phone != "undefined" ? key.phone : ''}</h6>
            <p class="card-text"><a href="${typeof key.website != "undefined" ? key.website : ''}" target=”_blank” class="card-link">${typeof key.website != "undefined" ? "Link locale" : ''}</a></p>
            </div>
          </div>
        `);
document.addEventListener('click', function() {
    const cardElements = document.querySelectorAll('.card');
  
    cardElements.forEach(card => {
      const titleElement = card.querySelector('.card-title');
      const localeName = titleElement.textContent;
      titleElement.addEventListener('click', function() {
        const encodedLocaleName = encodeURIComponent(localeName);
        window.location.href = `/users/localPage?title=${encodedLocaleName}`;
      });
    });
  });

      card.appendChild(heart);

      grid.appendChild(card);
      i++;
    }//fine for

    var form = document.getElementById("form-submit");
    var i = 0;

    for (var i = 0; i < hearts_map.size; i++){
      
      (function (index) {
        document.getElementById('heart'+i).addEventListener('click', function() {
          hrt = document.getElementById('heart'+index);
          if (hrt.className == "fa fa-heart-o"){
            hrt.className = "fa fa-heart";
            var params = {
              card: hearts_map.get('heart'+index),
            }
            fetch('/users/map/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(params)
            });
            return;
          } else {
            hrt.className = "fa fa-heart-o";
            var params = {
              card: hearts_map.get('heart'+index),
            }
            fetch('/users/map/delete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(params)
            });
            return;
          }

        })
      })(i);

    } //fine for
  });



var banned_types = ["Piano bar", "Night club", "Nightclub", "Disco club", "Cocktail bar", "Dance club"];

  function toStringHTML (node){
    return node.outerHTML;
  }

  function inLista(elem,list){
    for (var i = 0; i < list.length; i++){
      if (elem == list[i]) return true;
    }
  return false;
  }

  function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }

  function sortByDistance(data,lat,long){
    var map_dist = new Map();
    for (var i = 0; i < data.length; i++){
      if (getDistanceFromLatLonInKm(lat,long,data[i].gps_coordinates.latitude,data[i].gps_coordinates.longitude) > 7) continue;
      map_dist.set(data[i],getDistanceFromLatLonInKm(lat,long,data[i].gps_coordinates.latitude,data[i].gps_coordinates.longitude));
    }
    var mapSort2 = new Map([...map_dist.entries()].sort((a, b) => a[1] - b[1]));
    return mapSort2;
  }


  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}





var lt = 41.90908; 
var lg = 12.52062; 