const { createClient } = require('@supabase/supabase-js');
const io = require('socket.io')(process.env.PORT || 3000, {
    cors: {
        origin: 'https://hvt299.github.io',
        methods: ['GET', 'POST']
    }
});

// Kết nối đến Supabase
const supabaseUrl = "https://kqzqauoobpdfudixhsom.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxenFhdW9vYnBkZnVkaXhoc29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzOTI3OTIsImV4cCI6MjA0NTk2ODc5Mn0.tlpKzVe9M4R3bjnbaKtEJbpMavooPmVr6n_FU8SxuIo";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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