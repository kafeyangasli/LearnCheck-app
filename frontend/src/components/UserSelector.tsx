import React, { useState } from "react";

export interface UserPreference {
  id: string;
  name: string;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'default' | 'serif';
}

const USERS: UserPreference[] = [
  { id: 'user1', name: 'User 1', theme: 'dark', fontSize: 'small', fontFamily: 'default' },
  { id: 'user2', name: 'User 2', theme: 'light', fontSize: 'medium', fontFamily: 'default' },
  { id: 'user3', name: 'User 3', theme: 'dark', fontSize: 'small', fontFamily: 'default' },
  { id: 'user4', name: 'User 4', theme: 'light', fontSize: 'medium', fontFamily: 'serif' },
];

interface UserSelectorProps {
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
}

const UserSelector = ({ selectedUserId, onUserSelect }: UserSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedUser = USERS.find(u => u.id === selectedUserId);

  const getThemeIcon = (theme: string) => {
    return theme === 'dark' ? '🌙' : '☀️';
  };

  const getFontSizeIcon = (size: string) => {
    if (size === 'small') return '📘';
    if (size === 'large') return '📕';
    return '📗';
  };

  const getFontFamilyIcon = (family: string) => {
    return family === 'serif' ? '📰' : '📄';
  };

  return (
    <div className="user-selector">
      <button
        className="user-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">👤</div>
        <div className="user-info">
          <span className="user-name">{selectedUser?.name || 'Select User'}</span>
          <div className="user-preferences">
            {selectedUser && (
              <>
                <span title={selectedUser.theme}>{getThemeIcon(selectedUser.theme)}</span>
                <span title={selectedUser.fontSize}>{getFontSizeIcon(selectedUser.fontSize)}</span>
                <span title={selectedUser.fontFamily}>{getFontFamilyIcon(selectedUser.fontFamily)}</span>
              </>
            )}
          </div>
        </div>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <h3>Pilih User</h3>
            <p>Setiap user memiliki preferensi yang berbeda</p>
          </div>

          <div className="user-list">
            {USERS.map(user => (
              <button
                key={user.id}
                className={`user-item ${selectedUserId === user.id ? 'selected' : ''}`}
                onClick={() => {
                  onUserSelect(user.id);
                  setIsOpen(false);
                }}
              >
                <div className="user-avatar">👤</div>
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <div className="user-preferences">
                    <span title={user.theme}>{getThemeIcon(user.theme)}</span>
                    <span title={user.fontSize}>{getFontSizeIcon(user.fontSize)}</span>
                    <span title={user.fontFamily}>{getFontFamilyIcon(user.fontFamily)}</span>
                  </div>
                </div>
                {selectedUserId === user.id && (
                  <span className="check-icon">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="dropdown-legend">
            <h4>Legend:</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span>🌙 Dark / ☀️ Light</span>
              </div>
              <div className="legend-item">
                <span>📘 Small / 📗 Medium / 📕 Large</span>
              </div>
              <div className="legend-item">
                <span>📄 Default / 📰 Serif</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="user-selector-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UserSelector;
