$(document).ready(function () {
    var googleScriptURL =
        "https://script.google.com/macros/s/AKfycbzTZFY5UWIh44pPgeHdwGm-ARfyVjgpfWkEhPzmJbOUnaFwL4mQEM7hbTYMTnPN4gD_/exec";

    // 初始化 DataTables
    var table = $("#sheetTable").DataTable({
        ajax: {
            url: googleScriptURL + "?action=read",
            beforeSend: function () {
                $("#loadStatus")
                    .html('<i class="fas fa-spinner fa-spin"></i> 載入中...')
                    .show();
            },
            dataSrc: "data",
        },
        initComplete: function (settings, json) {
            $("#loadStatus")
                .html('<i class="fas fa-check"></i> 完成!')
                .fadeOut(1000); // 3秒後淡出

            console.log("完成");
        },
        columns: [
            {
                data: "title",
                title: "相簿名稱",
            },
            {
                data: null,
                orderable: false,
                defaultContent:
                    "<button class='btn btn-sm btn-danger deleteBtn'><i class='fas fa-trash'></i></button>",
                width: "15%",
            },
        ],
        columnDefs: [
            {
                targets: "_all",
                className: "dt-center",
            },
        ],
        language: {
            url: "zh_Hant.json",
        },
        responsive: true,
        lengthChange: false, // 不顯示條目數量選擇器
        className: "compact",
        searching: false, // 不顯示搜尋框
        pageLength: 100, // 預設每頁顯示數量
        paging: false, // 不顯示分頁
        info: false, // 不顯示資訊
        ordering: false, // 不啟用排序
    });

    //  FUNCTION  手動重新加載 DataTables 數據時顯示載入提示
    function reloadTableData() {
        // 顯示載入中提示
        $("#loadStatus")
            .html('<i class="fas fa-spinner fa-spin"></i> 載入中...')
            .show();

        table.ajax.reload(function () {
            // 數據加載完成後的回調
            // 顯示完成提示並在1秒後淡出
            $("#loadStatus")
                .html('<i class="fas fa-check"></i> 同步中...')
        });

        // 數據加載完成後，發送GET請求到指定網址
        $.ajax({
            url: "https://teacherbackup.wentzao.com:1025/update_album",
            method: "GET",
            success: function(data) {
                $("#loadStatus")
                .html('<i class="fas fa-check"></i> 同步完成!')
                .fadeOut(2000);
            },
            error: function(xhr, status, error) {
                console.error("Update album request failed:", status, error);
            }
        });
    }

    // 處理刪除按鈕的點擊事件
    $("#sheetTable tbody").on("click", ".deleteBtn", function () {
        var data = table.row($(this).parents("tr")).data();
        if (confirm(`確定要刪除【${data.title}】相簿嗎？`)) {
            deleteAlbum(data.title);
        }
    });

    // 刪除相簿名稱
    function deleteAlbum(title) {
        $("#loadStatus")
            .html('<i class="fas fa-spinner fa-spin"></i> 刪除中...')
            .show();
        $.ajax({
            url: googleScriptURL,
            method: "POST",
            data: {
                action: "delete",
                title: title,
            },
            success: function (response) {
                // $("#loadStatus")
                //     .html('<i class="fas fa-check"></i> 完成!')
                //     .fadeOut(3000);
                reloadTableData();
            },
            error: function () {
                $("#loadStatus")
                    .html('<i class="fas fa-times"></i> 刪除失敗')
                    .show();
            },
        });
    }

    // 處理新增按鈕的點擊事件，打開模態框
    $("#addNewBtn").on("click", function () {
        $("#titleField").val(""); // 清空輸入框
        $("#editModal").modal("show");
    });

    // 處理模態框中的儲存按鈕點擊事件，新增相簿名稱
    $("#saveBtn").on("click", function () {
        var title = $("#titleField").val().trim();
        if (title === "") {
            alert("相簿名稱不能為空！");
            return;
        }
        createAlbum(title);
    });

    // 新增相簿名稱
    function createAlbum(title) {
        $("#saveStatus")
            .html('<i class="fas fa-spinner fa-spin"></i> 新增中...')
            .show();
        $.ajax({
            url: googleScriptURL,
            method: "POST",
            data: {
                action: "create",
                title: title,
            },
            success: function (response) {
                $("#saveStatus")
                    .html('<i class="fas fa-check"></i> 完成!')
                    .fadeOut(2000);
                $("#editModal").modal("hide");
                reloadTableData();
            },
            error: function () {
                $("#saveStatus")
                    .html('<i class="fas fa-times"></i> 新增失敗')
                    .show();
            },
        });
    }
});
