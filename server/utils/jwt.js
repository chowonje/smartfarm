const jwt = require('jsonwebtoken');

const generateAdminToken = (admin) => {
    return jwt.sign(
        {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            type: 'admin'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
    );
};

const generateRegisterToken = (register) => {
    return jwt.sign(
        {
            idx: register.idx,
            id: register.id,
            name: register.name,
            email: register.email,
            phone: register.phone,
            address: register.address,
            role: register.role,
            type: 'register'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};

module.exports = {
    generateAdminToken,
    generateRegisterToken,
    verifyToken
}; 