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
    
    // Xử lý sự kiện đăng ký
    socket.on('DANG_KY', async ({ username, password }) => {
        // Kiểm tra người dùng đã tồn tại
        const { data: existingUser, error: checkError } = await supabase
            .from('account')
            .select('*')
            .eq('username', username)
            .single();

        if (existingUser) {
            return socket.emit('DANG_KY_THAT_BAI', 'Username đã tồn tại');
        }

        // Tạo tài khoản mới
        const { error: insertError } = await supabase
            .from('account')
            .insert([{ username, password, role: 'Học sinh' }]);

        if (insertError) {
            console.error('Error creating user:', insertError);
            return socket.emit('DANG_KY_THAT_BAI', 'Lỗi khi tạo tài khoản');
        }

        socket.emit('DANG_KY_THANH_CONG', 'Đăng ký thành công');
    });
    
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
        if (isExist) return socket.emit('DANG_KY_THATBAI');
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