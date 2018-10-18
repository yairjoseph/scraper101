$(".new-note").on("click", function() {
    $(".note-submit").attr("data-id", $(this).attr("data-id"))
    $("#modal-pop").modal("show");
    //$("#modal-pop").find(".note-submit").attr("data-id", $(this).attr("data-id"))
    // console.log($(this).attr("data-id"))
})

$(".note-submit").on("click", function(event) {
    event.preventDefault();
    let title = $(".noteHead").val();
    let body = $(".noteBody").val();
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title,
            body
        }
    }).then(function () {
        $(".noteHead").val("");
        $(".noteBody").val("");
    })
})

$(".delete-note").on("click", function() {
    event.preventDefault();
    var noteId = $(this).attr("data-id");

    $.ajax({
        method: "DELETE",
        url: "/notes/" + noteId
    }).then(function () {
        $(".noteHeadView").text("");
        $(".noteBodyView").val("");
        window.location.reload();
    })
});

$(".show-note").on("click", function() {
    var articleId = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/notes/" + articleId
    }).then(data => {
        const [d] = data
        console.log(data)
        console.log(d)
        if (d) {
            // event.preventDefault();
            $(".viewModalShow").modal("show");
            // console.log(data)
            $(".noteHeadView").text(d.title);
            $(".noteBodyView").val(d.body);
            $(".delete-note").attr("data-id", d._id)

        } else {
            $(".noNote").modal("show");

        }
    })
});
