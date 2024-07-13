
// CREAZIONE POST
fetch('/get_post')
.then(response => response.json())
.then(async data => {
    var container = document.getElementById('post-container');
    var post;
    var heart_id;
    var heart_map = new Map();

    const response = await fetch('/post/get_like');
    const like_list = await response.json();    

    for (var i = 0; i < data.length; i++){
        var liked_post = like_list.filter(post => post.post_id === data[i].id);
        console.log(liked_post);
        heart_id = 'heart' + data[i].id;
        post = createHTML(`
                        <div class="post">
                            <h3><a href='/users/profile/${data[i].username}'>${data[i].username}</a></h3>
                            <p>${data[i].text}</p>
                            ${data[i].img_src ? `<img src="../uploads/${data[i].img_src}" style="max-width: 30%; max-height: auto; margin-bottom: 20px;" />` : ''}
                            <i class="${liked_post.length > 0 ? 'fa-solid fa-heart': 'fa-regular fa-heart'}" id='${heart_id}' style="position: relative;"></i>
                       </div>
        `);
        heart_map.set(heart_id, data[i].id);
        container.appendChild(post);
    }
    var send_value = 1;

    for (var i = 0; i < heart_map.size; i++){
        (function (index) {
            document.getElementById(getKeyByIndex(heart_map,i)).addEventListener('click', function() {
                var key = getKeyByIndex(heart_map,index);
                bn = document.getElementById(key);
                var post_id = heart_map.get(key);
                //vuoto -> pieno: aggiungi like e cambia classe
                if (bn.className == 'fa-regular fa-heart'){
                    bn.className = 'fa-solid fa-heart';
                    send_value = 1;
                    //aggiorna like
                    fetch(`/posts/${post_id}/like`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                          },
                        body: JSON.stringify({ value: send_value })
                    });
                } else {
                    send_value = -1;
                    bn.className = 'fa-regular fa-heart';
                    //aggiorna like
                    fetch(`/posts/${post_id}/like`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                          },
                        body: JSON.stringify({ value: send_value })
                    });
                }
                    
                return;
            })
        })(i);
    }
});

function getKeyByIndex(map, index) {
    const keysArray = Array.from(map.keys());
    return keysArray[index];
  }  


function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}

/////////////////
////////////////
////////////////
////////////////
////////////////

// for (var i = start; i < start + heart_map.size; i++){
//     (function (index) {
//         document.getElementById('heart'+i).addEventListener('click', function() {
//             bn = document.getElementById('heart'+index);
//             //vuoto -> pieno: aggiungi like e cambia classe
//             if (bn.className == 'fa-regular fa-heart'){
//                 bn.className = 'fa-solid fa-heart';
//                 send_value = 1;
//                 //aggiorna like
//                 fetch(`/posts/${index}/like`, {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json'
//                       },
//                     body: JSON.stringify({ value: send_value })
//                 });
//             } else {
//                 send_value = -1;
//                 bn.className = 'fa-regular fa-heart';
//                 //aggiorna like
//                 fetch(`/posts/${index}/like`, {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json'
//                       },
//                     body: JSON.stringify({ value: send_value })
//                 });
//             }
                
//             return;
//         })
//     })(i);
// }