
const ROLES = {
    SUPER_ADMIN: 'super_admin',
    MANAGER: 'manager',
    CONTENT_CREATOR: 'content_creator',
    CLIENT: 'client',
    AFFILIATE: 'affiliate'
};

const ROLE_REDIRECTS = {
    super_admin: '/admin/dashboard.html',
    manager: '/admin/dashboard.html',
    content_creator: '/admin/dashboard.html',
    client: '/portal/dashboard.html',
    affiliate: '/admin/dashboard.html'
};

const DEMO_USERS = {
    'admin@mekongmarketing.com': { password: 'admin123', role: 'super_admin', name: 'Admin' },
    'manager@mekongmarketing.com': { password: 'manager123', role: 'manager', name: 'Manager' },
    'creator@mekongmarketing.com': { password: 'creator123', role: 'content_creator', name: 'Creator' },
    'client@mekongmarketing.com': { password: 'client123', role: 'client', name: 'Client Demo' },
    'affiliate@mekongmarketing.com': { password: 'affiliate123', role: 'affiliate', name: 'Affiliate Demo' }
};

function testLogin(email, password, expectedUrl) {
    console.log(`Testing login for: ${email}...`);

    const user = DEMO_USERS[email];

    if (!user) {
        console.error(`❌ FAILED: User not found in demo database`);
        return false;
    }

    if (user.password !== password) {
        console.error(`❌ FAILED: Incorrect password`);
        return false;
    }

    const redirectUrl = ROLE_REDIRECTS[user.role] || '/';

    if (redirectUrl === expectedUrl) {
        console.log(`✅ SUCCESS: Role [${user.role}] -> Redirects to [${redirectUrl}]`);
        return true;
    } else {
        console.error(`❌ FAILED: Expected [${expectedUrl}] but got [${redirectUrl}]`);
        return false;
    }
}

console.log('════════════════════════════════════════');
console.log('🤖 AUTOMATED LOGIN FLOW TEST');
console.log('════════════════════════════════════════\n');

const tests = [
    { e: 'admin@mekongmarketing.com', p: 'admin123', url: '/admin/dashboard.html' },
    { e: 'manager@mekongmarketing.com', p: 'manager123', url: '/admin/dashboard.html' },
    { e: 'creator@mekongmarketing.com', p: 'creator123', url: '/admin/dashboard.html' },
    { e: 'client@mekongmarketing.com', p: 'client123', url: '/portal/dashboard.html' },
    { e: 'affiliate@mekongmarketing.com', p: 'affiliate123', url: '/admin/dashboard.html' }
];

let passed = 0;
tests.forEach(t => {
    if (testLogin(t.e, t.p, t.url)) passed++;
    console.log('---');
});

console.log(`\nTest Result: ${passed}/${tests.length} passed.`);

if (passed === tests.length) {
    process.exit(0);
} else {
    process.exit(1);
}
