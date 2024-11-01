const { createClient } = require('@supabase/supabase-js');
const io = require('socket.io')(process.env.PORT || 3000, {
    cors: {
        origin: 'https://hvt299.github.io',
        methods: ['GET', 'POST']
    }
});

// Kết nối đến Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const arrUserInfo = [];
const messages = [];

io.on('connection', socket => {
    
    socket.on('DANG_NHAP', async ({ username, password }) => {
        const { data: user, error } = await supabase
            .from('account')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error || !user) {
            return socket.emit('DANG_NHAP_THAT_BAI', 'Tên đăng nhập hoặc mật khẩu không đúng');
        }

        socket.emit('DANG_NHAP_THANH_CONG');
    });
    
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