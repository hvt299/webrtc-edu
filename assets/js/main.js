const socket = io('https://webrtc-edu.onrender.com');

// $('#btnCreateRoom').click(() => {
//     // Chuyển hướng đến trang meeting.html
//     window.location.href = `meeting.html`;
// });

socket.on('DANH_SACH_ONLINE', o => {
    $('#div-chat').show();
    $('#div-chatbox').show();
    $('#div-welcome').hide();

    // o.users.forEach(user => {
    //     const { ten, peerID } = user;
    //     $('#ulUser').append(`<li id="${peerID}">${ten}</li>`);
    // });

    // socket.on('CO_NGUOI_DUNG_MOI', user => {
    //     const { ten, peerID } = user;
    //     $('#ulUser').append(`<li id="${peerID}">${ten}</li>`);
    // });

    // socket.on('AI_DO_NGAT_KET_NOI', peerID => {
    //     $(`#${peerID}`).remove();
    // });

    // o.messages.forEach(message => {
    //     document.getElementById("messages").textContent += message.username + ": " + message.message + "\n";
    // });

    // socket.on('TIN_NHAN_MOI', message => {
    //     document.getElementById("messages").textContent += message.username + ": " + message.message + "\n";
    // })
});

socket.on('DANG_NHAP_THANH_CONG', ({ fullname }) => {
    // Chuyển hướng đến trang home.html
    window.location.href = `home.html?fullname=${encodeURIComponent(fullname)}`;
});
socket.on('DANG_KY_THANH_CONG', message => {
    alert(message);
    // Chuyển hướng đến trang index.html
    window.location.href = 'index.html';
});

socket.on('DANG_NHAP_THAT_BAI', message => alert(message));
socket.on('DANG_KY_THAT_BAI', message => alert(message));
socket.on('DANG_KY_THATBAI', () => alert('Vui lòng chọn username khác!'));

// let localStream;  // Biến để lưu stream local

function openStream() {
    const config = { audio: true, video: true };
    return navigator.mediaDevices.getUserMedia(config).then(stream => {
        localStream = stream;  // Lưu stream để có thể bật/tắt sau này
        return stream;
    });
}

// Thêm sự kiện cho nút tắt/mở camera
$('#btnToggleCamera').click(() => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled; // Bật/tắt camera
        $('#btnToggleCamera').text(videoTrack.enabled ? 'Tắt Camera' : 'Mở Camera');
    }
});

// Thêm sự kiện cho nút tắt/mở mic
$('#btnToggleMic').click(() => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled; // Bật/tắt mic
        $('#btnToggleMic').text(audioTrack.enabled ? 'Tắt Mic' : 'Mở Mic');
    }
});

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream()
// .then(stream => playStream('localStream', stream));

// const peer = new Peer();

// peer.on('open', id => {
//     $('#my-peer').append(id);
//     $('#btnContinue').click(() => {
//         const username = $('#txtUsername').val();
//         if (username != null && username != "") {
//             socket.emit('NGUOI_DUNG_DANG_KY', { ten: username, peerID: id });
//         } else {
//             alert('Username không thể bỏ trống!');
//         }
//     });
// });

// Caller
// $('#btnCall').click(() => {
//     const id = $('#remoteID').val();
//     openStream()
//     .then(stream => {
//         playStream('localStream', stream);
//         const call = peer.call(id, stream);
//         call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
//     });
// });

// Callee
// peer.on('call', call => {
//     openStream()
//     .then(stream => {
//         call.answer(stream);
//         playStream('localStream', stream);
//         call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
//     });
// });

// $('#ulUser').on('click', 'li', function() {
//     const id = $(this).attr('id');
//     openStream()
//     .then(stream => {
//         playStream('localStream', stream);
//         const call = peer.call(id, stream);
//         call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
//     });
// });

// $('#btnSend').click(() => {
//     const username = $('#txtUsername').val();
//     const message = $('#yourMessage').val();
//     if (message != null && message != "") {
//         document.getElementById("yourMessage").value = "";
//         document.getElementById("messages").textContent += "YOU: " + message + "\n";
//         socket.emit("GUI_TIN_NHAN", {username: username, message: message});
//     } else {
//         alert('Tin nhắn không thể bỏ trống!');
//     }
// });

$('#btnLogin').click(() => {
    const username = $('#txtUsername').val();
    const password = $('#txtPassword').val();

    if (username == null || username == "") {
        alert('Username không thể bỏ trống!');
        return;
    }

    if (password == null || password == "") {
        alert('Password không thể bỏ trống!');
        return;
    }

    // Gửi yêu cầu đăng nhập
    socket.emit('DANG_NHAP', { username, password });
});

$('#btnSignUp').click(() => {
    const username = $('#txtUsername').val();
    const fullname = $('#txtFullname').val();
    const password = $('#txtPassword').val();
    const repassword = $('#txtRePassword').val();

    if (username == null || username == "") {
        alert('Username không thể bỏ trống!');
        return;
    }

    if (fullname == null || fullname == "") {
        alert('Fullname không thể bỏ trống!');
        return;
    }

    if (password == null || password == "") {
        alert('Password không thể bỏ trống!');
        return;
    }

    if (repassword != password) {
        alert('Xác nhận lại password không khớp');
        return;
    }

    // Gửi yêu cầu đăng ký
    socket.emit('DANG_KY', { username, fullname, password });
});

$('#btnBackSignUp').click(() => {
    window.location.href = 'signup.html';
});

$('#btnBackLogin').click(() => {
    window.location.href = 'index.html';
});

const peer = new Peer(); // Tạo một Peer mới
const connectedPeers = new Set(); // Đối tượng lưu trữ các kết nối peer
let localStream; // Biến để lưu luồng video của người dùng

// Khi Peer được kết nối
peer.on('open', id => {
    const roomID = new URLSearchParams(window.location.search).get('roomID');
    console.log('Your peer ID is: ' + id);
    document.getElementById('my-peer').textContent = `ID của tôi: ${id}`;
    socket.emit('join-room', roomID, id);
});

socket.on('user-connected', peerID => {
    if (!connectedPeers.has(peerID)) {
        connectToNewUser(peerID, localStream);
        connectedPeers.add(peerID);
    }
});

socket.on('user-disconnected', peerID => {
    if (connectedPeers.has(peerID)) {
        const videoWrapper = document.querySelector(`.remote-video-wrapper[data-peer-id="${peerID}"]`);
        if (videoWrapper) {
            videoWrapper.remove(); // Xóa thẻ video khỏi DOM
        }
        connectedPeers.delete(peerID); // Xóa peerID khỏi danh sách kết nối
    }
});

function connectToNewUser(peerID, stream) {
    const call = peer.call(peerID, stream); // Gọi đến người mới
    call.on('stream', remoteStream => {
        addRemoteStream(peerID, remoteStream); // Thêm video từ người mới
    });
    call.on('close', () => {
        const videoWrapper = document.querySelector(`.remote-video-wrapper[data-peer-id="${peerID}"]`);
        if (videoWrapper) {
            videoWrapper.remove();
        }
        connectedPeers.delete(peerID);
    });
    connectedPeers.add(peerID);
}


// Khi có kết nối đến từ peer khác
peer.on('connection', function(conn) {
    connections[conn.peer] = conn; // Lưu trữ kết nối
    conn.on('data', function(data) {
        console.log('Received', data);
    });
});

// Khi có cuộc gọi đến từ một peer
peer.on('call', call => {
    if (!connectedPeers.has(call.peer)) {
        call.answer(localStream); // Trả lời cuộc gọi với localStream
        call.on('stream', remoteStream => {
            addRemoteStream(call.peer, remoteStream);
        });
        connectedPeers.add(call.peer);
    }
});

// Khi người dùng nhấn nút "Tạo phòng"
document.getElementById('btnCreateRoom').addEventListener('click', function() {
    // Tạo room ID (có thể để người dùng tạo ID hoặc tự động)
    const roomID = generateRandomRoomID();
    alert(`Room ID: ${roomID}. Share this ID with others to join.`);
});

// Kết nối đến room bằng ID đã nhập
document.getElementById('btnConnectRoom').addEventListener('click', function() {
    const remoteID = document.getElementById('roomID').value;
    
    // Kết nối dữ liệu
    const conn = peer.connect(remoteID);
    connections[remoteID] = conn; // Lưu kết nối dữ liệu
    
    conn.on('open', function() {
        conn.send('Hello from your peer!');
    });

    // Gọi video đến peer khác
    const call = peer.call(remoteID, localStream);
    connections[remoteID] = call; // Lưu kết nối video
    call.on('stream', function(remoteStream) {
        addRemoteStream(remoteID, remoteStream);
    });
});

// Lấy luồng media từ webcam khi người dùng nhấn nút "Tham gia"
document.getElementById('btnConnectRoom').addEventListener('click', function() {
    const remoteID = document.getElementById('roomID').value;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(function(stream) {
            localStream = stream;
            const localVideo = document.getElementById('localStream');
            localVideo.srcObject = localStream;

            const conn = peer.connect(remoteID);
            conn.on('open', function() {
                conn.send(`Người dùng ${fullname} đã tham gia vào phòng: ${remoteID}`);
            });

            const call = peer.call(remoteID, localStream);
            call.on('stream', function(remoteStream) {
                addRemoteStream(remoteID, remoteStream);
            });
        })
        .catch(function(err) {
            console.log('Failed to get local stream', err);
        });
});


// Hàm thêm luồng video từ peer khác vào trang
function addRemoteStream(peerID, stream) {
    const videoContainer = document.getElementById('videoContainer');

    // Kiểm tra xem đã có video với peerID này chưa
    let existingVideoWrapper = document.querySelector(`.remote-video-wrapper[data-peer-id="${peerID}"]`);
    
    if (existingVideoWrapper) {
        // Nếu đã có video, cập nhật lại luồng stream
        const existingVideoElement = existingVideoWrapper.querySelector('video');
        existingVideoElement.srcObject = stream;
    } else {
        // Nếu chưa có, tạo video mới
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.controls = true;
        videoElement.classList.add('remote-video');

        // Tạo div wrapper cho video với class và data-peer-id để theo dõi
        const videoWrapper = document.createElement('div');
        videoWrapper.classList.add('col', 'l-6', 'm-6', 'c-12', 'remote-video-wrapper');
        videoWrapper.setAttribute('data-peer-id', peerID); // Gán data attribute để dễ kiểm tra

        videoWrapper.appendChild(videoElement);
        videoContainer.appendChild(videoWrapper);
    }
}

// Hàm tạo room ID ngẫu nhiên
function generateRandomRoomID() {
    return Math.random().toString(36).substr(2, 9);
}
