$(".new-note").on("click", function () {
    $("#modal-pop").modal("show");
    $(".note-submit").attr("data-id", $(this).attr("data-id"))
})

$(".note-submit").on("click", function (event) {
    event.preventDefault();
    let title = $(".noteHead").val();
    let body = $(".noteBody").val();
    var thisId = $(this).attr("data-id");
    // console.log(title, body)
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title,
            body
        }
    }).then(function(){
        $(".noteHead").val("");
        $(".noteBody").val("");
    })
})

$(".delete-note").on("click", function () {
    event.preventDefault();
    var noteId = $(this).attr("data-id");

    $.ajax({
        method: "DELETE",
        url: "/notes/" + noteId
    }).then(function(){
        $(".noteHeadView").text("");
        $(".noteBodyView").val("");
        res.redirect("/")


    })
});

$(".show-note").on("click", function () {
    $(".viewModalShow").modal("show");
    event.preventDefault();
    var articleId = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/articles/" + articleId
    }).then(data => {
        console.log(data)
        $(".noteHeadView").text(data.note.title);
        $(".noteBodyView").text(data.note.body);
        $(".delete-note").attr("data-id", data.note._id)
    })

})
