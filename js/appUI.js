//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <hr>
                <p>
                    Petite application de gestion de favoris à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
let selectedCategory = "";
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await Bookmarks_API.Get();
    let catégories = [];
    eraseContent();
    console.log(selectedCategory);
    if (selectedCategory == "") {
        DisplayAllBookmarks(bookmarks);
    }
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            if (selectedCategory == bookmark.Catégorie && selectedCategory != "") {
                $("#content").append(renderBookmark(bookmark));
            }
            if (catégories.indexOf(bookmark.Catégorie) == -1) {
                catégories.push(bookmark.Catégorie);
            }
        });
        eraseCategories();
        catégories.forEach(cat => {
            $("#Catégories").append(renderCategorie(cat, cat == selectedCategory));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { })
        $("#displayAllCmd").on("click", function (e) {
            selectedCategory = "";
            console.log(selectedCategory);
            renderBookmarks();
        })
        $(".cate").on("click", function (e) {
            selectedCategory = $(this).attr("catégorie_id");
            renderBookmarks();
        });
    } else {
        renderError("Service introuvable");
    }
}
function DisplayAllBookmarks(bookmarks) {
    bookmarks.forEach(bookmark => {
        $("#content").append(renderBookmark(bookmark));
    });
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function eraseCategories() {
    $("#Catégories").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await Bookmarks_API.Get(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Favori introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await Bookmarks_API.Get(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le bookmark suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
                <div class="bookmarkContainer">
                    <div class="bookmarkLayout">
                    <span class="bookmarkTitre">
                    <a href="${bookmark.Url}" ><div class="small-favicon" style="display: inline-block; background-image: url('http://www.google.com/s2/favicons?sz=64&amp;domain=${bookmark.Url}/');"></div></a>
                     <span style="display: inline-block">${bookmark.Titre}</span>
                 </span>
                        <div class="bookmarkCategorie">${bookmark.Catégorie}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await Bookmarks_API.Delete(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favoris introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Titre = "";
    bookmark.Url = "";
    bookmark.Catégorie = "";
    return bookmark;
}
let newUrl = "bookmark.png";
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>

            <div id="formIcon">

            </div>
              <br>
            <label for="Titre" class="form-label">Nom </label>
            <input 
                class="form-control"
                name="Titre" 
                id="Name" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un nom"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${bookmark.Titre}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer votre url" 
                InvalidMessage="Veuillez entrer un url valide"
                value="${bookmark.Url}" 
            />
            <label for="Email" class="form-label">Catégorie </label>
            <input 
                class="form-control"
                name="Catégorie"
                id="Categorie"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer votre catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${bookmark.Catégorie}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    if (create) {
        $('#formIcon').append('<img src="bookmark.png" class="big-favicon" alt="" title="Gestionnaire de favoris">')
    }
    else {
        $('#formIcon').append('<a href="' + bookmark.Url + '"><img class="big-favicon" src="https://www.google.com/s2/favicons?sz=32&domain=' + bookmark.Url + '"></a>')
    }
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await Bookmarks_API.Save(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark) {
    return $(`
     <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkLayout">
            <span class="bookmarkTitre">
           <a href="${bookmark.Url}" ><div class="small-favicon" style="display: inline-block; background-image: url('http://www.google.com/s2/favicons?sz=64&amp;domain=${bookmark.Url}/');"></div></a>
            <span style="display: inline-block">${bookmark.Titre}</span>
        </span>
         <span class="bookmarkCategorie">${bookmark.Catégorie}</span>
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Titre}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Titre}"></span>
            </div>
        </div>
    </div>           
    `);
}

function renderCategorie(catégorie, checked = false) {
    let checkAttribute = checked ? "fa-check" : "fa-fw";
    return $(`
    <div class="dropdown-item cate" catégorie_id="${catégorie}">
     <i class="menuIcon fa ${checkAttribute}"></i>
     <span>${catégorie}</span>
    </div>
    `);
}