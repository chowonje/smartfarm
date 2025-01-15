const jwt = require('jsonwebtoken');

const checkAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: '인증 토큰이 필요합니다.' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // admin 테이블의 사용자인지 확인
        if (!decoded.id || decoded.type !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: '관리자 권한이 필요합니다.' 
            });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            type: 'admin'
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false, 
            message: '유효하지 않은 토큰입니다.' 
        });
    }
};

const checkRegister = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: '인증 토큰이 필요합니다.' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // register 테이블의 사용자인지 확인
        if (!decoded.idx || decoded.type !== 'register') {
            return res.status(403).json({ 
                success: false, 
                message: 'register 권한이 필요합니다.' 
            });
        }

        req.user = {
            idx: decoded.idx,
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            phone: decoded.phone,
            address: decoded.address,
            role: decoded.role,
            type: 'register'
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false, 
            message: '유효하지 않은 토큰입니다.' 
        });
    }
};

module.exports = {
    checkAdmin,
    checkRegister
};
