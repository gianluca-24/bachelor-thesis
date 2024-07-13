fetch("/users/get_post/0")
.then(response => response.json())
.then(data => {
    var div_cont = document.getElementById('');
    var container = document.getElementById('post-container');
    var post;
    var bin_id;
    var bin_map = new Map();

    for (var i = 0; i < data.length; i++){
        bin_id = 'bin' + data[i].id;
        post = createHTML(`
                        <div class="post">
                            <h3>${data[i].username}</h3>
                            <p>${data[i].text}</p>
                            ${data[i].img_src ? `<img src="../uploads/${data[i].img_src}" style="max-width: 20%; max-height: auto; margin-bottom: 20px;" />` : ''}
                            <i class="fa-solid fa-trash" id ='${bin_id}'></i>
                       </div>
        `);
        bin_map.set(bin_id,data[i].id);
        container.appendChild(post);
    }

    for (var i= 0; i < bin_map.size; i++){
        (function (index) {
            document.getElementById(getKeyByIndex(bin_map,i)).addEventListener('click', function() {
                var key = getKeyByIndex(bin_map,index);
                bn = document.getElementById(key);
                var post_id = bin_map.get(key);
                fetch(`/posts/${post_id}/delete`, {
                    method: 'POST',
                });
                window.location.replace('/users/profile');
                return;
            })
        })(i);
    }

});

function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}

function getKeyByIndex(map, index) {
    const keysArray = Array.from(map.keys());
    return keysArray[index];
  }  