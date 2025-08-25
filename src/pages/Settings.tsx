// src/pages/Settings.tsx
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../AuthContext";
import { db, doc, updateDoc } from "../firebase";
import { User, Save, Shield, Palette, Trash2 } from 'lucide-react';

const avatarColors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];

export default function Settings() {
  const { user, userProfile, updateUserEmail, updateUserPassword, deleteAccount } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [msg, setMsg] = useState({ text: '', type: 'success' });
  const [avatarType, setAvatarType] = useState('male');
  const [avatarColor, setAvatarColor] = useState(avatarColors[0]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState(userProfile?.preferredLang || 'en');

  useEffect(() => {
    if (userProfile?.photoURL) {
        try {
            const url = new URL(userProfile.photoURL);
            // --- FIX REGION 1: Logic to read the new avatar style ---
            // This now checks for the specific hairstyle parameter ('top[]')
            const topParam = url.searchParams.getAll('top[]');
            const seedParam = url.searchParams.get('seed'); // Fallback for old style
            const color = url.searchParams.get('backgroundColor');
            
            if (topParam.includes('LongHairStraight')) {
                setAvatarType('female');
            } else if (seedParam === 'female') { // Fallback for old 'personas' style
                setAvatarType('female');
            } else {
                setAvatarType('male');
            }

            if (color) setAvatarColor(`#${color}`);
        } catch (e) { console.error("Could not parse avatar URL", e); }
    }
    if (userProfile) setPreferredLang(userProfile.preferredLang);
  }, [userProfile]);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
  };

  const handleSaveAvatar = async () => {
    if (!user) return;
    // --- FIX REGION 2: Logic to generate the new avatar URL ---
    // This now uses the 'avataaars' style with specific hairstyles for a clear distinction.
    const topType = avatarType === 'female' ? 'LongHairStraight' : 'ShortHairShortFlat';
    const newPhotoURL = `https://api.dicebear.com/7.x/avataaars/svg?top[]=${topType}&backgroundColor=${avatarColor.substring(1)}`;
    try {
        await updateDoc(doc(db, "users", user.uid), { photoURL: newPhotoURL });
        showMessage("Avatar updated successfully!");
    } catch (error) {
        showMessage("Failed to update avatar.", "error");
    }
  };

  const handleSaveLanguage = async () => {
    if (!user) return;
    try {
        await updateDoc(doc(db, "users", user.uid), { preferredLang });
        showMessage("Language preference saved!");
    } catch (error) {
        showMessage("Failed to save language.", "error");
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !currentPassword) return showMessage("All fields are required.", "error");
    try {
        await updateUserEmail(currentPassword, newEmail);
        showMessage("Email updated successfully!");
        setCurrentPassword(''); setNewEmail('');
    } catch (error: any) { showMessage(error.message, "error"); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showMessage("New passwords do not match.", "error");
    try {
        await updateUserPassword(currentPassword, newPassword);
        showMessage("Password updated successfully!");
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) { showMessage(error.message, "error"); }
  };

  const handleDeleteAccount = async () => {
    if (!currentPassword) return showMessage("Please enter your password to confirm deletion.", "error");
    if (window.confirm("Are you sure? This action is irreversible.")) {
        try {
            await deleteAccount(currentPassword);
        } catch (error: any) { showMessage(error.message, "error"); }
    }
  };

  const sections = { profile: { icon: User, label: 'Profile' }, chats: { icon: Palette, label: 'Chats & Appearance' }, security: { icon: Shield, label: 'Security' }, danger: { icon: Trash2, label: 'Danger Zone' } };
  
  // --- FIX REGION 3: Logic to generate the preview avatar URL ---
  const topTypePreview = avatarType === 'female' ? 'LongHairStraight' : 'ShortHairShortFlat';
  const currentAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?top[]=${topTypePreview}&backgroundColor=${avatarColor.substring(1)}`;

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <Sidebar />
      <main className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <nav className="flex flex-row md:flex-col gap-1">
                {Object.entries(sections).map(([key, { icon: Icon, label }]) => (
                    <button key={key} onClick={() => setActiveSection(key)} className={`flex items-center gap-3 p-2 rounded-md text-sm w-full text-left ${activeSection === key ? 'bg-blue-100 dark:bg-slate-800 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                        <Icon size={18} />
                        <span className="hidden md:inline">{label}</span>
                    </button>
                ))}
            </nav>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
            {msg.text && (
                <div className={`p-3 rounded-md mb-6 text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {msg.text}
                </div>
            )}

            {activeSection === 'profile' && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-700">Profile Information</h3>
                    <div className="flex items-center gap-6">
                        <img src={currentAvatarUrl} alt="Avatar Preview" className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white dark:border-slate-700 shadow-md" />
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Icon Style</label>
                                <div className="flex gap-2 mt-1">
                                    <button onClick={() => setAvatarType('male')} className={`px-3 py-1 text-sm rounded-full ${avatarType === 'male' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700'}`}>Male</button>
                                    <button onClick={() => setAvatarType('female')} className={`px-3 py-1 text-sm rounded-full ${avatarType === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-200 dark:bg-slate-700'}`}>Female</button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Color</label>
                                <div className="flex gap-2 mt-1">
                                    {avatarColors.map(color => (
                                        <button key={color} onClick={() => setAvatarColor(color)} className={`w-6 h-6 rounded-full border-2 ${avatarColor === color ? 'border-blue-500' : 'border-transparent'}`} style={{ backgroundColor: color }}></button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                     <button onClick={handleSaveAvatar} className="flex items-center gap-2 text-sm bg-green-500 text-white px-4 py-2 rounded-md">
                        <Save size={16}/> Save Avatar
                    </button>
                    <div className="pt-4">
                        <label className="text-sm text-slate-500">Username</label>
                        <p className="font-medium text-lg">{userProfile?.username}</p>
                    </div>
                    <div>
                        <label className="text-sm text-slate-500">Email</label>
                        <p className="font-medium text-lg">{user?.email}</p>
                    </div>
                </div>
            )}
            
            {/* Other sections remain the same */}
            {activeSection === 'chats' && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-700">Chats & Appearance</h3>
                    <div>
                        <label htmlFor="lang-select" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Default Language</label>
                        <p className="text-xs text-slate-500 mb-2">This will be your default language for receiving translated messages in new chats.</p>
                        <select id="lang-select" value={preferredLang} onChange={e => setPreferredLang(e.target.value)} className="p-2 border rounded bg-white dark:bg-slate-700">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="hi">Hindi</option>
                            <option value="bn">Bengali</option>
                            <option value="zh">Chinese</option>
                            <option value="ja">Japanese</option>
                            <option value="pt">Portuguese</option>
                            <option value="ru">Russian</option>
                            <option value="ar">Arabic</option>
                        </select>
                        <button onClick={handleSaveLanguage} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save</button>
                    </div>
                </div>
            )}

            {activeSection === 'security' && (
                <div className="space-y-8">
                    <form onSubmit={handleUpdateEmail} className="space-y-3">
                        <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-700">Change Email</h3>
                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New Email" required className="w-full max-w-sm p-2 border rounded bg-white dark:bg-slate-700" />
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" required className="w-full max-w-sm p-2 border rounded bg-white dark:bg-slate-700" />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Update Email</button>
                    </form>
                    <form onSubmit={handleUpdatePassword} className="space-y-3">
                        <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-700">Change Password</h3>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" required className="w-full max-w-sm p-2 border rounded bg-white dark:bg-slate-700" />
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required className="w-full max-w-sm p-2 border rounded bg-white dark:bg-slate-700" />
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="w-full max-w-sm p-2 border rounded bg-white dark:bg-slate-700" />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Update Password</button>
                    </form>
                </div>
            )}

            {activeSection === 'danger' && (
                 <div className="space-y-4 p-4 border border-red-500 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                    <div>
                        <p className="text-sm font-medium">Delete Account</p>
                        <p className="text-xs text-slate-500 mb-2">This will permanently delete your account, profile, and all your chats. This action is irreversible.</p>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter your password to confirm" className="w-full max-w-sm p-2 border rounded bg-white dark:bg-slate-700 mb-2" />
                        <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm">Delete My Account</button>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
