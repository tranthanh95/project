module.exports = io => {
    // Using model
    const file_md = require("../models/file.js");

    // List socket.
    var users = [];

    // Lang nghe ket noi den server
    io.on("connection", (socket) => {
        console.log("Co nguoi ket noi " + socket.id);

        // List file name.
        var listFilesOfUser = [];

        // Lang nghe su kien nguoi dung dang nhap vao.
        socket.on("new-user", (data) => {
            // data contain id user.
            socket.nickname = data;

            // Push socket user to array.
            users.push(socket);

            // Return file by id from database.
            var listFiles = file_md.getFilesById(data);
            if (listFiles) {
                listFiles.then((files) => {
                    if (files.length > 0) {
                        for (var i = 0; i < files.length; i++) {
                            console.log(files[i]);
                            listFilesOfUser.push(files[i]);
                        }
                        console.log(listFilesOfUser);
                        socket.emit("send-list-files", listFilesOfUser);
                    }
                }).catch((error) => {
                    console.log(error);
                });
            }
        });

        // console.log(listFilesName);
        socket.emit("send-list-files", listFilesOfUser);

        //Lang nghe su kien gui file len server.(co the la 1 hoac nhieu file.)
        socket.on("send-file-success", (data, id) => {
            console.log(data);

            for (var i = 0; i < data.length; i++) {
                listFilesOfUser.push(data[i]);
            }

            /* Check list user and send send event upload file.
                Real list folder when user upload file.
             */
            for (let i = 0; i < users.length; i++) {
                if (users[i].nickname === id) {
                    // Send event socket of user has an id = id of client submit.
                    users[i].emit("send-list-files", listFilesOfUser);
                }
            }
        });

        // Lang nghe su kien mat ket noi.
        socket.on("disconnect", () => {
            console.log(socket.id + " ngat ket noi!!");
        });
    });
}