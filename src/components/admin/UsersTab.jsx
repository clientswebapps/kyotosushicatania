import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, UserPlus, Mail, Trash2 } from "lucide-react";

export default function UsersTab({
  user,
  adminUsers,
  adminUsersLoading,
  createAdminUser,
  removeAdminUser,
}) {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserError("");
    setUserSuccess("");
    setAddingUser(true);

    if (!newUserEmail || !newUserPassword) {
      setUserError("Email and Password are required.");
      setAddingUser(false);
      return;
    }

    if (newUserPassword.length < 6) {
      setUserError("Password must be at least 6 characters long.");
      setAddingUser(false);
      return;
    }

    try {
      await createAdminUser(newUserEmail, newUserPassword, newUserName);
      setUserSuccess(`Admin user ${newUserEmail} created successfully.`);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
    } catch (err) {
      console.error(err);
      setUserError(err.message || "Failed to create admin user.");
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setUserError("");
    setUserSuccess("");

    // Prevent deletion of the super admin user
    const userToDelete = adminUsers.find((u) => u.id === userId);
    if (userToDelete && userToDelete.email === "admin@kyotosushicatania.com") {
      setUserError("The super admin account cannot be deleted.");
      return;
    }

    if (deletingUserId === userId) {
      try {
        await removeAdminUser(userId);
        setUserSuccess("Admin user access revoked successfully.");
        setDeletingUserId(null);
      } catch (err) {
        console.error(err);
        setUserError(err.message || "Failed to delete admin user.");
      }
    } else {
      setDeletingUserId(userId);
      // Auto-reset delete state after 4 seconds
      setTimeout(() => {
        setDeletingUserId((prev) => (prev === userId ? null : prev));
      }, 4000);
    }
  };

  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="admin-menu-header">
        <h2>Admin User Settings</h2>
        <p>Add and manage team members who have admin access to the dashboard</p>
      </div>

      <div className="admin-menu-grid">
        <div className="admin-menu-form-container">
          <h2>Add Admin User</h2>
          <form onSubmit={handleAddUser} className="admin-menu-form">
            <div className="form-group">
              <label htmlFor="newUserName">Display Name</label>
              <input
                id="newUserName"
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g. Kyoto Chef"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newUserEmail">Email Address *</label>
              <div style={{ position: "relative" }}>
                <input
                  id="newUserEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  placeholder="e.g. admin@kyotosushicatania.com"
                  style={{ paddingLeft: "36px" }}
                />
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#666",
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newUserPassword">Password *</label>
              <input
                id="newUserPassword"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
                placeholder="Min 6 characters"
              />
            </div>

            {userError && (
              <div className="form-error" style={{ margin: "8px 0" }}>
                {userError}
              </div>
            )}
            {userSuccess && (
              <div className="form-success" style={{ margin: "8px 0", color: "#4caf50", fontSize: "14px" }}>
                {userSuccess}
              </div>
            )}

            <button
              type="submit"
              className="admin-add-item-btn"
              disabled={addingUser}
              style={{ marginTop: "16px" }}
            >
              {addingUser ? (
                <div className="admin-spinner" style={{ marginRight: "6px" }}></div>
              ) : (
                <UserPlus size={16} />
              )}
              <span>{addingUser ? "Adding User..." : "Add Admin User"}</span>
            </button>
          </form>
        </div>

        <div className="admin-menu-list-container">
          <div className="admin-menu-list-header">
            <h2>Manage Admin Access</h2>
          </div>

          {adminUsersLoading ? (
            <div className="admin-loading-spinner-wrapper">
              <div className="menu-loading-spinner"></div>
            </div>
          ) : (
            <div className="admin-menu-items-list">
              {adminUsers.map((u) => (
                <div key={u.id} className="admin-menu-item-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "rgba(224, 169, 109, 0.1)",
                        border: "1px solid rgba(224, 169, 109, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-brand-gold)",
                        flexShrink: 0,
                      }}
                    >
                      <Shield size={18} />
                    </div>

                    <div className="admin-menu-item-info">
                      <h4 style={{ margin: 0 }}>{u.displayName || "Admin User"}</h4>
                      <p style={{ fontSize: "12px", color: "#888", margin: "2px 0 0 0" }}>
                        {u.email}
                      </p>
                      {u.createdAt && (
                        <p style={{ fontSize: "10px", color: "#555", margin: "2px 0 0 0" }}>
                          Added: {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="admin-menu-item-actions">
                    {u.email === "admin@kyotosushicatania.com" ? (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--color-brand-gold)",
                          background: "rgba(224, 169, 109, 0.15)",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontWeight: "600",
                          border: "1px solid rgba(224, 169, 109, 0.3)",
                        }}
                      >
                        Super Admin
                      </span>
                    ) : user && user.uid === u.id ? (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--color-brand-gold)",
                          background: "rgba(224, 169, 109, 0.1)",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        You (Active)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="admin-delete-row-btn"
                        title="Revoke Access"
                        style={{
                          background: deletingUserId === u.id ? "#dc3545" : "",
                          color: deletingUserId === u.id ? "#fff" : "",
                          padding: deletingUserId === u.id ? "4px 8px" : "",
                          borderRadius: deletingUserId === u.id ? "4px" : "",
                        }}
                      >
                        {deletingUserId === u.id ? "Confirm?" : <Trash2 size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {adminUsers.length === 0 && (
                <p className="admin-empty-state" style={{ padding: "20px 0" }}>
                  No registered admin users.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
