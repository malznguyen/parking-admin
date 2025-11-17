// lib/constants.ts

export const PARKING_CONFIG = {
    TOTAL_SPOTS: 500,
    RESERVED_STAFF: 100,
    RESERVED_MONTHLY: 250,
    PUBLIC_SPOTS: 150,

    GATES: ['A', 'B', 'C', 'D'] as const,

    PRICING: {
        FIRST_HOUR: 5000,        // 5,000 VND
        ADDITIONAL_HOUR: 3000,   // 3,000 VND/giờ
        OVERNIGHT: 20000,        // 20,000 VND qua đêm
        MONTHLY_STUDENT: 100000, // 100,000 VND/tháng
        MONTHLY_STAFF: 0,        // Miễn phí CBGV
    },

    BUSINESS_HOURS: {
        OPEN: '05:00',
        CLOSE: '23:00',
    },

    LPR_CONFIDENCE_THRESHOLD: {
        HIGH: 95,
        MEDIUM: 80,
        LOW: 60,
    },
};

export const DEPARTMENTS = [
    'Khoa Cơ khí',
    'Khoa Điện - Điện tử',
    'Khoa Công nghệ thông tin',
    'Khoa Kinh tế',
    'Khoa Ngoại ngữ',
    'Phòng Đào tạo',
    'Phòng Hành chính',
    'Phòng Kế hoạch Tài chính',
    'Thư viện',
    'Ban Quản lý KTX',
];

export const VEHICLE_BRANDS = [
    'Honda',
    'Yamaha',
    'Suzuki',
    'SYM',
    'Piaggio',
    'Pega',
    'VinFast',
    'Yadea',
];

export const COLORS = [
    'Đen',
    'Trắng',
    'Đỏ',
    'Xanh',
    'Bạc',
    'Vàng',
];

export const VIETNAMESE_NAMES = {
    firstNames: [
        'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
        'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Cao', 'Mai', 'Tô'
    ],
    middleNames: [
        'Văn', 'Thị', 'Đức', 'Hữu', 'Minh', 'Quốc', 'Anh', 'Hoàng', 'Xuân', 'Thu',
        'Thanh', 'Tuấn', 'Công', 'Bảo', 'Phương', 'Tùng', 'Huy', 'Duy', 'Ngọc'
    ],
    lastNames: [
        'An', 'Bình', 'Cường', 'Dũng', 'Giang', 'Hà', 'Hiếu', 'Hùng', 'Khoa', 'Linh',
        'Long', 'Mai', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Thành', 'Tú', 'Vương',
        'Yến', 'Hằng', 'Thảo', 'Lan', 'Hương', 'Chi', 'Phương', 'Anh', 'Hoa'
    ]
};