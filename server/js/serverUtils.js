export function generateRoomCode(codeLength) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = '';
    for (let i = 0; i < codeLength; ++i) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}