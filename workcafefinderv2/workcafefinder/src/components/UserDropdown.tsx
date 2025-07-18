import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface UserDropdownProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update UserDropdown component to handle null supabase client
  const handleUpdateName = async () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }

    if (!supabase) {
      alert('Authentication service not available');
      return;
    }

    setIsUpdating(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        alert('Auth session missing!');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: { name: newName.trim() }
      });

      if (error) {
        alert('Failed to update name: ' + error.message);
      } else {
        alert('Name updated successfully!');
        setIsEditing(false);

        // ✅ Refresh user metadata without signing out
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Failed to refresh user:', userError.message);
        } else {
          setNewName(userData.user?.user_metadata?.name || '');
        }
      }
    } catch (err) {
      alert('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };



  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#666',
          padding: '0.5rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
      >
        {user.user_metadata?.name || user.email}
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '200px',
          zIndex: 1002,
          marginTop: '4px'
        }}>
          {/* User Info */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #eee',
            background: '#f9f9f9'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
              {user.user_metadata?.name || 'No name set'}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {user.email}
            </div>
          </div>

          {/* Edit Name */}
          {isEditing ? (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value.slice(0, 25))}
                placeholder="Enter your name"
                maxLength={25}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  marginBottom: '4px',
                  background: '#f5f5f5',
                  color: '#000'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateName()}
              />
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', textAlign: 'right' }}>
                {newName.length}/25
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleUpdateName}
                  disabled={isUpdating || !newName.trim()}
                  style={{
                    padding: '6px 12px',
                    background: isUpdating ? '#ccc' : '#65b5a4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: isUpdating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(user?.user_metadata?.name || '');
                  }}
                  style={{
                    padding: '6px 12px',
                    background: 'none',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#000'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                color: '#333',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              ✏️ Edit Name
            </button>
          )}

          {/* Sign Out */}
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left',
              color: '#333',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            🚪 Sign Out
          </button>


        </div>
      )}
    </div>
  );
};

export default UserDropdown; 