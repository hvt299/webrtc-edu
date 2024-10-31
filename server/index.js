const io = require('socket.io')(process.env.PORT || 3000, {
    cors: {
        origin: 'https://hvt299.github.io',
        methods: ['GET', 'POST']
    }
});

const arrUserInfo = [];
const messages = [];

io.on('connection', socket => {
    socket.on('NGUOI_DUNG_DANG_KY', user => {
        const isExist = arrUserInfo.some(e => e.ten === user.ten);
        socket.peerID = user.peerID;
        if (isExist) return socket.emit('DANG_KY_THAT_BAI');
        arrUserInfo.push(user);
        socket.emit('DANH_SACH_ONLINE', {users: arrUserInfo, messages: messages});
        socket.broadcast.emit('CO_NGUOI_DUNG_MOI', user);
    });

    socket.on('disconnect', () => {
        const index = arrUserInfo.findIndex(user => user.peerID === socket.peerID);
        arrUserInfo.splice(index, 1);
        io.emit('AI_DO_NGAT_KET_NOI', socket.peerID);
    });

    socket.on('GUI_TIN_NHAN', o => {
        messages.push(o);
        socket.broadcast.emit('TIN_NHAN_MOI', o);
    })
});