const fs = require('fs');
const path = require('path');

const sampleFiles = [
    { dir: 'spaces', file: 'desk_flexi_01.jpg' },
    { dir: 'spaces', file: 'meeting_room_alpha.jpg' },
    { dir: 'spaces', file: 'private_office_01.jpg' },
    { dir: 'spaces', file: 'desk_alpha_01.jpg' },
    { dir: 'members', file: 'member_john.jpg' },
    { dir: 'members', file: 'budi.jpg' },
    { dir: 'members', file: '1787799592972-544446318.jpeg' },
    { dir: 'general', file: 'banner.jpg' },
    { dir: 'general', file: '1787799592972-544446318.jpeg' }
];

// Minimal 1x1 pixel JPEG buffer
const minimalJpgBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const buffer = Buffer.from(minimalJpgBase64, 'base64');

for (const item of sampleFiles) {
    const targetDir = path.resolve(__dirname, '../../uploads', item.dir);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetPath = path.join(targetDir, item.file);
    if (!fs.existsSync(targetPath)) {
        fs.writeFileSync(targetPath, buffer);
    }
}

console.log(' Sample demo upload files created.');
