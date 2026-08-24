import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, CreditCard, ShoppingBag, MapPin, Settings } from 'lucide-react';
import ShoppingInsights from '../components/ShoppingInsights';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return (
    <div className="container py-12 flex justify-center">
      <div className="skeleton" style={{ width: '100%', maxWidth: '800px', height: '400px' }}></div>
    </div>
  );

  return (
    <div className="container py-12" style={{ maxWidth: '900px' }}>
      <h1 className="text-3xl font-bold text-primary mb-8">My Account</h1>
      
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        
        <div className="card overflow-hidden">
          <div className="bg-bg-subtle p-8 text-center border-b border-border">
            <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-md">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold mb-2">{user.name || 'User'}</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-primary rounded-full text-xs font-bold uppercase tracking-wider border border-border">
              <Shield size={14} /> {user.role}
            </div>
          </div>
          
          <div className="p-4 flex flex-col gap-2">
            <button className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-bg-subtle text-primary font-medium">
              <User size={18} /> Personal Info
            </button>
            <button className="flex items-center gap-3 w-full text-left p-3 rounded-lg text-muted hover:bg-gray-50 hover:text-primary transition-colors font-medium">
              <ShoppingBag size={18} /> My Orders
            </button>
            <button className="flex items-center gap-3 w-full text-left p-3 rounded-lg text-muted hover:bg-gray-50 hover:text-primary transition-colors font-medium">
              <MapPin size={18} /> Shipping Addresses
            </button>
            <button className="flex items-center gap-3 w-full text-left p-3 rounded-lg text-muted hover:bg-gray-50 hover:text-primary transition-colors font-medium">
              <CreditCard size={18} /> Payment Methods
            </button>
            <button className="flex items-center gap-3 w-full text-left p-3 rounded-lg text-muted hover:bg-gray-50 hover:text-primary transition-colors font-medium">
              <Settings size={18} /> Account Settings
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <ShoppingInsights />
          <div className="card p-8">
            <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border flex items-center gap-2">
              <User size={20} className="text-muted" /> Personal Information
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-muted block mb-1">Full Name</label>
                <div className="font-medium text-lg">{user.name}</div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-muted block mb-1">Email Address</label>
                <div className="font-medium text-lg">{user.email}</div>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted block mb-1">Account Role</label>
                <div className="font-medium text-lg">{user.role}</div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-muted block mb-1">Status</label>
                <div className="inline-flex items-center gap-1.5 text-success font-medium bg-success-bg px-2 py-0.5 rounded-md text-sm mt-1 border border-green-200">
                  <div className="w-2 h-2 rounded-full bg-success"></div> Active
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border flex justify-end">
              <button className="btn-outline">Edit Profile</button>
            </div>
          </div>

          <div className="card p-8 bg-bg-subtle border-dashed border-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Security & Password</h3>
                <p className="text-muted text-sm">Keep your account secure by updating your password regularly.</p>
              </div>
              <button className="btn-primary py-2 px-4">Change Password</button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;
