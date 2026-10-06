const fileInput = document.getElementById("fileInput");

const dropzone = document.getElementById("dropzone");

const fileSection = document.getElementById("fileSection");

const fileList = document.getElementById("fileList");

const fileCount = document.getElementById("fileCount");

const convertButton =
    document.getElementById("convertButton");

const clearButton =
    document.getElementById("clearButton");


let files = [];


// ===============================
// ВЫБОР ФАЙЛОВ
// ===============================

fileInput.addEventListener("change", function () {

    addFiles(this.files);

});


// ===============================
// DRAG & DROP
// ===============================

dropzone.addEventListener("dragover", function (event) {

    event.preventDefault();

    dropzone.classList.add("dragging");

});


dropzone.addEventListener("dragleave", function () {

    dropzone.classList.remove("dragging");

});


dropzone.addEventListener("drop", function (event) {

    event.preventDefault();

    dropzone.classList.remove("dragging");

    addFiles(event.dataTransfer.files);

});


// ===============================
// ДОБАВЛЕНИЕ ФАЙЛОВ
// ===============================

function addFiles(newFiles) {

    const selectedFiles = Array.from(newFiles);

    const validFiles = selectedFiles.filter(function (file) {

        return (
            file.type === "image/jpeg" ||
            file.type === "image/png"
        );

    });


    files = [...files, ...validFiles];

    renderFiles();

}


// ===============================
// ОТОБРАЖЕНИЕ ФАЙЛОВ
// ===============================

function renderFiles() {

    fileList.innerHTML = "";

    fileCount.textContent = files.length;


    if (files.length === 0) {

        fileSection.style.display = "none";

        convertButton.disabled = true;

        return;
    }


    fileSection.style.display = "block";

    convertButton.disabled = false;


    files.forEach(function (file, index) {

        const item = document.createElement("div");

        item.className = "file-item";


        const preview = document.createElement("div");

        preview.className = "file-preview";


        const image = document.createElement("img");

        image.src = URL.createObjectURL(file);


        preview.appendChild(image);


        const info = document.createElement("div");

        info.className = "file-info";


        const name = document.createElement("strong");

        name.textContent = file.name;


        const size = document.createElement("span");

        size.textContent =
            formatFileSize(file.size);


        info.appendChild(name);

        info.appendChild(size);


        const removeButton =
            document.createElement("button");

        removeButton.className = "remove";

        removeButton.textContent = "×";


        removeButton.addEventListener(
            "click",
            function () {

                removeFile(index);

            }
        );


        item.appendChild(preview);

        item.appendChild(info);

        item.appendChild(removeButton);


        fileList.appendChild(item);

    });

}


// ===============================
// УДАЛЕНИЕ ФАЙЛА
// ===============================

function removeFile(index) {

    files.splice(index, 1);

    renderFiles();

}


// ===============================
// ОЧИСТКА
// ===============================

clearButton.addEventListener(
    "click",
    function () {

        files = [];

        fileInput.value = "";

        renderFiles();

    }
);


// ===============================
// РАЗМЕР ФАЙЛА
// ===============================

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1)
            + " KB"
        );

    }


    return (
        (bytes / (1024 * 1024)).toFixed(1)
        + " MB"
    );

}


// ===============================
// СОЗДАНИЕ PDF
// ===============================

convertButton.addEventListener(
    "click",
    createPDF
);


async function createPDF() {

    if (files.length === 0) {

        return;

    }


    convertButton.disabled = true;

    convertButton.innerHTML =
        "Создание PDF...";


    try {

        const { jsPDF } = window.jspdf;


        let pdf = null;


        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            const file = files[i];


            const imageData =
                await readImage(file);


            const image =
                await loadImage(imageData);


            const width =
                image.naturalWidth;

            const height =
                image.naturalHeight;


            const orientation =
                width > height
                    ? "landscape"
                    : "portrait";


            if (i === 0) {

                pdf = new jsPDF({
                    orientation: orientation,
                    unit: "px",
                    format: [width, height]
                });

            } else {

                pdf.addPage(
                    [width, height],
                    orientation
                );

            }


            pdf.addImage(
                imageData,
                "JPEG",
                0,
                0,
                width,
                height
            );

        }


        pdf.save("doctool.pdf");


    } catch (error) {

        console.error(error);

        alert(
            "Не удалось создать PDF."
        );

    }


    convertButton.disabled = false;

    convertButton.innerHTML =
        'Создать PDF <span>→</span>';

}


// ===============================
// ЧТЕНИЕ ИЗОБРАЖЕНИЯ
// ===============================

function readImage(file) {

    return new Promise(function (
        resolve,
        reject
    ) {

        const reader =
            new FileReader();


        reader.onload = function () {

            resolve(reader.result);

        };


        reader.onerror = function () {

            reject(
                new Error(
                    "Ошибка чтения файла"
                )
            );

        };


        reader.readAsDataURL(file);

    });

}


// ===============================
// ЗАГРУЗКА IMAGE
// ===============================

function loadImage(src) {

    return new Promise(function (
        resolve,
        reject
    ) {

        const image =
            new Image();


        image.onload = function () {

            resolve(image);

        };


        image.onerror = function () {

            reject(
                new Error(
                    "Ошибка загрузки изображения"
                )
            );

        };


        image.src = src;

    });

}
